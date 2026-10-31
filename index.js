(function (v) {
  "use strict";

  const vendetta = v || window.vendetta || window.revenge || window.bunny;
  let unpatches = [];

  // Default Settings State
  const defaultSettings = {
    // Media & Compression
    noCompression: true,
    mediaViewing: true,
    fileSizeOnPicker: true,
    altMediaPicker: true,

    // Chat & Messaging
    useSystemEmoji: true,
    freeStickers: true,
    silentTyping: true,
    messageLogger: true,
    cleanUrls: true,
    exactTimestamps: true,

    // Voice & Calls
    antiCall: true,
    noBandwidthKick: true,
    bluetoothAudioFix: false,
    backgroundAudio: true,

    // Interface & Utilities
    platformIndicators: true,
    openExternalBrowser: true,
    storeButtons: true,
  };

  function getStorage() {
    return (vendetta && vendetta.plugin && vendetta.plugin.storage) || defaultSettings;
  }

  function getReact() {
    return (vendetta && vendetta.metro && vendetta.metro.common && vendetta.metro.common.React) || window.React;
  }

  function getRN() {
    return (vendetta && vendetta.metro && vendetta.metro.common && vendetta.metro.common.ReactNative) || window.ReactNative || {};
  }

  // Safe recursive React tree search
  function findInReactTree(tree, filter) {
    if (!tree || typeof tree !== "object") return null;
    try {
      if (filter(tree)) return tree;
      if (Array.isArray(tree)) {
        for (const item of tree) {
          const res = findInReactTree(item, filter);
          if (res) return res;
        }
        return null;
      }
      const children = tree.props?.children || tree.children;
      if (children) {
        const res = findInReactTree(children, filter);
        if (res) return res;
      }
    } catch (_) {}
    return null;
  }

  // Format bytes into human-readable strings
  function formatBytes(bytes) {
    if (!bytes || bytes === 0) return "0 B";
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  }

  // Use System Emoji AST parser (by nexpid)
  function iterateSystemEmoji(rows) {
    if (!rows || !Array.isArray(rows)) return rows;
    const content = [];
    let header;
    for (const original of rows) {
      let row = original;
      if (row && row.type === "emoji" && row.surrogate) {
        row = { type: "text", content: row.surrogate };
      }
      if (row && Array.isArray(row.content)) {
        row.content = iterateSystemEmoji(row.content);
      }
      if (row && Array.isArray(row.items)) {
        row.items = iterateSystemEmoji(row.items);
      }

      if (original && original.jumboable && !header) {
        header = { type: "heading", level: 1, content: [] };
      }
      if (
        original &&
        (original.type === "emoji" || original.type === "customEmoji") &&
        !original.jumboable &&
        header
      ) {
        content.push(header);
        header = undefined;
      }

      if (header) {
        header.content.push(row);
      } else {
        content.push(row);
      }
    }
    if (header) content.push(header);
    return content;
  }

  // Tracker stripping utility
  function stripUrlTrackers(text) {
    if (!text || typeof text !== "string") return text;
    const TRACKERS = [
      "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content",
      "si", "igshid", "fbclid", "gclid", "t", "s", "feature"
    ];
    return text.replace(/https?:\/\/[^\s]+/g, (url) => {
      try {
        const parsed = new URL(url);
        TRACKERS.forEach((t) => parsed.searchParams.delete(t));
        return parsed.toString();
      } catch (_) {
        return url;
      }
    });
  }

  // Extract highest-resolution avatar URL (4096px, GIF if animated, PNG if static)
  function getUserAvatarUrl(user, guildId) {
    if (!user) return null;
    try {
      if (guildId && user.guildMemberAvatars && user.guildMemberAvatars[guildId]) {
        const hash = user.guildMemberAvatars[guildId];
        const ext = hash.startsWith("a_") ? "gif" : "png";
        return `https://cdn.discordapp.com/guilds/${guildId}/users/${user.id}/avatars/${hash}.${ext}?size=4096`;
      }
      if (typeof user.getAvatarURL === "function") {
        const u = user.getAvatarURL(guildId, 4096, true) || user.getAvatarURL(false, 4096, true);
        if (u) return String(u).replace(/\.webp(\?size=\d+)?$/, ".png$1");
      }
      if (user.avatar) {
        const ext = user.avatar.startsWith("a_") ? "gif" : "png";
        return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${ext}?size=4096`;
      }
      const idx = Number(BigInt(user.id || 0) >> 22n) % 6;
      return `https://cdn.discordapp.com/embed/avatars/${idx}.png`;
    } catch (_) {
      return "https://cdn.discordapp.com/embed/avatars/0.png";
    }
  }

  // Extract highest-resolution banner URL across various Discord prop structures
  function extractBannerUrl(args) {
    if (!args) return null;
    const first = Array.isArray(args) ? args[0] : args;
    if (!first) return null;

    if (first.bannerSource && typeof first.bannerSource.uri === "string") {
      return first.bannerSource.uri.replace(/(?:\?size=\d{3,4})?$/, "?size=4096").replace(".webp", ".png");
    }

    const user = first.user;
    if (user && user.banner) {
      const ext = user.banner.startsWith("a_") ? "gif" : "png";
      return `https://cdn.discordapp.com/banners/${user.id}/${user.banner}.${ext}?size=4096`;
    }

    if (first.guildMember && first.guildMember.banner && first.guildId && user) {
      const ext = first.guildMember.banner.startsWith("a_") ? "gif" : "png";
      return `https://cdn.discordapp.com/guilds/${first.guildId}/users/${user.id}/banners/${first.guildMember.banner}.${ext}?size=4096`;
    }

    return null;
  }

  // Non-destructive in-place attachment of onLongPress to existing component trees
  function attachLongPress(node, handler) {
    if (!node || typeof node !== "object") return;
    if (node.props) {
      const origOnLongPress = node.props.onLongPress;
      node.props.onLongPress = function (e) {
        try { handler(e); } catch (_) {}
        if (typeof origOnLongPress === "function") {
          return origOnLongPress.apply(this, arguments);
        }
      };

      if (node.props.children) {
        if (Array.isArray(node.props.children)) {
          node.props.children.forEach((c) => attachLongPress(c, handler));
        } else {
          attachLongPress(node.props.children, handler);
        }
      }
    }
  }

  // File size badge component for media picker thumbnails (FileSizeOnPicker by MSMA)
  const fileSizeCache = {};
  function SizeTag({ url }) {
    const React = getReact();
    const RN = getRN();
    const [size, setSize] = React.useState(fileSizeCache[url] ? formatBytes(fileSizeCache[url]) : "...");

    React.useEffect(() => {
      if (!url) return;
      if (fileSizeCache[url]) {
        setSize(formatBytes(fileSizeCache[url]));
        return;
      }
      const FM =
        (RN.TurboModuleRegistry && (RN.TurboModuleRegistry.get("NativeFileModule") || RN.TurboModuleRegistry.get("RTNFileManager") || RN.TurboModuleRegistry.get("DCDFileManager"))) ||
        RN.NativeModules?.NativeFileModule ||
        RN.NativeModules?.RTNFileManager ||
        RN.NativeModules?.DCDFileManager ||
        (window.nativeModuleProxy && (window.nativeModuleProxy.NativeFileModule || window.nativeModuleProxy.RTNFileManager || window.nativeModuleProxy.DCDFileManager));

      if (FM && typeof FM.getSize === "function") {
        FM.getSize(url)
          .then((s) => {
            if (typeof s === "number") {
              fileSizeCache[url] = s;
              setSize(formatBytes(s));
            }
          })
          .catch(() => {});
      }
    }, [url]);

    return React.createElement(
      RN.Text,
      {
        style: {
          includeFontPadding: false,
          fontSize: 10,
          color: "#ffffff",
          fontWeight: "bold",
        },
      },
      size
    );
  }

  // Platform Indicators data & component (PlatformIndicators by MSMA)
  const STATUS_COLORS = {
    online: "#23a55a",
    idle: "#f0b232",
    dnd: "#f23f43",
    offline: "#80848e",
  };

  const PLATFORM_ICONS = {
    desktop: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEgAAABICAMAAABiM0N1AAAAVFBMVEUAAACvv7+3u7+5u7+2ub+4u726vL65u765vL65vMG5u723ub23v7+3t7+6vL+4ur+6u765u764vL+4ur23t7+7vb+3ur25ur64ur+7u766ur6vr7/+1nXbAAAAHHRSTlMAEEB/UHDv/99fgIAgQJ+f7++fnyB/YN9vTz8QSaZf3QAAAI1JREFUeAHt1tUBwkAURNEXHZzg1n+d2Fc8u4OTOQXcyKqJ3ARh5C22qiQFYTC0khFIYyuYgDYthGagzQuhDLRFIYS7yBPuakLmSaF2CimkkEIKKfT8I5un0MdCT7v6LUFbFUIhaGsr2IAUWcl2B0K2t6pDVKttGR5P3BJvpxCnfdTMHVo9NaRQ1MpKRC5jHSw3VFQzIwAAAABJRU5ErkJggg==",
    web: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEgAAABICAQAAAD/5HvMAAADgklEQVR42u3a32vVdRzH8VdOv2NzGzM7bkp0E9F9RQSbOmK6groQpeugOzXJfnCW3YwgC4IyHCldrBmFELtQRxfK2MHp1sjVZRfBMSJFYu6cMUnOOZPz9Gb45uyc79fv5/tDvDiPv+DJh/fn8+HL56umpqbHFZsZ4hjjzJOnQJkyBfLMM87H7GWzHh16OcoVKgQpM8N79Cht7GaSVcJa5QK7lBZe5SpRzDCgpLGdH6gS3SRPKzm8xTJxFTmgJNDKtyRllFbFQxfTRLVCvSk6FR3b+J3onuRTlllvgUzk1YmVsyJJdPMN1bqkzmizM00cc1rDIP9SawpPrjhFPAf1AN1cotZJ940ezwKb1q33BLX2Kzx2sBwzZ7vWoYXvAVOkV2FxlqjuMMtBNqkBNpIDzI/h7ywnTsfIP5gquxUGV3EiB7zMPcxlPRwDOJITTgNmpx6GyZSDnqKAOa9g9LKKIzniA0yFbQrC+5B6UDf/Y44oCFdwdUPOGMfkgr8kyrg6Lmf0YUq0yw9DuLnBcTw5YwNFzB754RhmkYaUCH7BDMsPZzDDZFMM+gQzJj/8inlTYiS1oNcws/LD35jnJUtKPOgFzHX5YQmzdmCRTSXoGcyi/FDGtEqWlHhQG6YULsjTA4zg5iZf4CkAXrig25gtUowk+FwB2IpZDDfUz8pEWiUF4DnM9XDbfkiKl6QAvB5u248H38KMJBZ0FDMW7uo4qwbIJhQ0gcnKD3sxN3lCirNKgZfrf5hB+aGdEuYVNUQ2dtAuTIk2+WMG87V8MBIzaBQzrdDDVqBDPuIE0cUy5rCC0MMq5lAqQR9hKmRcPoNu0ZF0EN0sYs7JBAyc+UwNsUJYd7nGO2zUGr4CTL9MqMGu8KIaYB43C2yVJPq4h8kpDAaoYv6kS3U4jKvfaGELeUyVfoXDT4C5wAatg8cfuHqbS4A54/K8UgTMd/WnNjuckyqAKdCj8DhArdO0NFilQ8xxhyiq7JMbRqk1GXAEuDshV3hMUesvXkoo6CKe3NHJArUqfEln7KBrdCgaMnVJcIsPa6OcczKKjk6mqFfkFH20RAi6SIfiweMkjS0xwTBvEFaVE3hKAvspEleBfUoOvTGfOH+mJ40X6ctEkaNfaWEn56kQVoVz9CltZDhCjhJBSuR4l4weHdrZwzBjzJFniTJlbpNnljGyDNLW/BmlqelxdR++AoGbDB4jjAAAAABJRU5ErkJggg==",
    mobile: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgCAMAAADVRocKAAAAXVBMVEUAAAAwMDgwMDUwMDUuMDYwMDYvMTcvMTYvMTYwMDYwMDUvMTYwMjUvMTUvMjYvMTUuMDUuMDQvMDUtMTUwMDgvMDUwMDAtMDYuMDYwMDAtMDUvMDYuMDUtMDcpMTo5aAq8AAAAH3RSTlMAIGBvf1C//89fMN9g75+/j3+fP0C/IFBfMGDPb08fcZ9WCgAAAMNJREFUeAHt2YWNxQAMg2EX/fiVud1/zBuhSaRjfwv8UsQx5J9L0iw/VySIyUoaXa7wu93pcE/g9KDTFS4F+amF5Em3ZwK7FwPeMEsYcoNVxZAaViX5uTd6MuQJKwY5A01u9goFWph1fyKggAIKKKCAAgoooIACCiiggAIKKKCAAgoooIACn/l9d/t3gU/fcEqG9LDKGVLB6saQAZ97owZ2w5NuzwEOKd1G4FMLE5wG36Y/w29ZadRviBn2/Nw2HfjTPgD3/UVA1TCAGgAAAABJRU5ErkJggg==",
    embedded: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEgAAABICAMAAABiM0N1AAAAk1BMVEUAAAC3u7+4ur+5vL+5u765u7+6vL+2ub+3v7+6u7+5vL66v7+6vL65u761ur+4u765vL+3t7+6u765u7+9vb23t7+7vb+6u766ur+5ur6/v7+vv7+9vcW1tb+5u727u763ur25vL+6vL+3ub24ur+5u7+4vL+5ur66ur64ur25vL+6u764ur24u722uby5u76vr7/eehxsAAAAMXRSTlMAQJ/f/8+fUCC/3zDv7zC/UEDvfx8gf88w3xAQHzCAT2Bfb4Bvj5/PP6+vv59wUM8QEONx+AAAAWZJREFUeAHt1dWa6zAMBOA5PSqzs2Vmhvd/uWWcVFHqr5f+r+3JRqtJ8UhBEAT/Mv8lpWwuD02hKHcpFXBTuSJ3qtZwQ0HPUVULiCuJhzpiGuKlCZaTL3gnxEVPaLWdkAxYJznIdfGmy0k9MEkOivChLQSkbwS18KElZEBBLSMIX4QMuRxaEJ0vCBndCkJMbEZjIRO6MTWCqjWlRjO6MTeCpLoooDWuCFvSjcgK0pYzohsrM0hZzhXdWJtBynJyR4rGv19dzrp3EC3nhoJKZpCynNxalzqIlrPKU7WDlOXUym8H0XIOufy+htxZX9tHBU24/L5mXH5fSy6/r4jL/8sOidYJv2x7fu0k84SgIn/Qmb50dT2oB6YXk+tf4hElWuuPdeaIlCFx/fkLeM+Q1Ferw3RQZ9SmP8jQlR9H/NZ3tKmG08+sW/SMnrxzZ6Qy/TrfBWkdL+Lq0RUptaYHJyU+HwRB4O0FjTMnvIkvoBQAAAAASUVORK5CYII=",
  };

  function StatusIconsComp({ userId, size = 14 }) {
    const React = getReact();
    const RN = getRN();
    const metro = vendetta?.metro;
    const PresenceStore = (metro?.findByStoreName && metro.findByStoreName("PresenceStore")) || metro?.findByProps("getState");
    const SessionsStore = (metro?.findByStoreName && metro.findByStoreName("SessionsStore")) || metro?.findByProps("getSessions");
    const UserStore = (metro?.findByStoreName && metro.findByStoreName("UserStore")) || metro?.findByProps("getCurrentUser");

    function getUserStatuses(uid) {
      if (!uid) return null;
      try {
        const currentUserId = UserStore?.getCurrentUser?.()?.id;
        if (uid === currentUserId && SessionsStore?.getSessions) {
          const sessions = SessionsStore.getSessions();
          if (sessions) {
            const acc = {};
            Object.values(sessions).forEach((curr) => {
              if (curr?.clientInfo?.client && curr.clientInfo.client !== "unknown") {
                acc[curr.clientInfo.client] = curr.status;
              }
            });
            return acc;
          }
        }
        const state = PresenceStore?.getState?.();
        return state?.clientStatuses?.[uid] || null;
      } catch (_) {
        return null;
      }
    }

    const statuses = getUserStatuses(userId);
    if (!statuses) return null;
    const platforms = Object.keys(statuses);
    if (!platforms.length) return null;

    return React.createElement(
      RN.View,
      { style: { flexDirection: "row", alignItems: "center", marginLeft: 4 } },
      platforms.map((p) => {
        const color = STATUS_COLORS[statuses[p]] || STATUS_COLORS.online;
        const uri = PLATFORM_ICONS[p];
        if (uri) {
          return React.createElement(RN.Image, {
            key: p,
            style: { width: size, height: size, tintColor: color, marginRight: 2 },
            source: { uri },
          });
        }
        return React.createElement(RN.View, {
          key: p,
          style: { width: size - 4, height: size - 4, borderRadius: 5, backgroundColor: color, marginRight: 2 },
        });
      })
    );
  }

  // Helper: Install Plugin into Revenge/Vendetta
  async function installPluginItem(installUrl, name) {
    try {
      const pm = vendetta.plugins || (vendetta.metro && vendetta.metro.findByProps("installPlugin"));
      if (pm && typeof pm.installPlugin === "function") {
        await pm.installPlugin(installUrl);
        if (vendetta.ui && vendetta.ui.toasts && vendetta.ui.toasts.showToast) {
          vendetta.ui.toasts.showToast(`Installed ${name}!`);
        }
        return true;
      }
    } catch (err) {
      if (vendetta.ui && vendetta.ui.toasts && vendetta.ui.toasts.showToast) {
        vendetta.ui.toasts.showToast(`Install failed: ${err?.message || err}`);
      }
    }
    return false;
  }

  // Helper: Install Theme into Revenge/Vendetta
  async function installThemeItem(installUrl, name) {
    try {
      const tm = vendetta.themes || (vendetta.metro && vendetta.metro.findByProps("installTheme"));
      if (tm && typeof tm.installTheme === "function") {
        await tm.installTheme(installUrl);
        if (vendetta.ui && vendetta.ui.toasts && vendetta.ui.toasts.showToast) {
          vendetta.ui.toasts.showToast(`Installed ${name}! Apply in Themes.`);
        }
        return true;
      }
    } catch (err) {
      if (vendetta.ui && vendetta.ui.toasts && vendetta.ui.toasts.showToast) {
        vendetta.ui.toasts.showToast(`Theme install failed: ${err?.message || err}`);
      }
    }
    return false;
  }

  // =========================================================================
  // PLUGIN STORE SCREEN (166 PLUGINS WITH WORKING/WARNING/BROKEN RATINGS)
  // =========================================================================
  function PluginStoreScreen() {
    const React = getReact();
    const RN = getRN();
    const { ScrollView, View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet } = RN;

    const [plugins, setPlugins] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [search, setSearch] = React.useState("");
    const [filter, setFilter] = React.useState("all");
    const [installedMap, setInstalledMap] = React.useState({});

    React.useEffect(() => {
      fetch("https://raw.githubusercontent.com/Purple-EyeZ/Plugins-List/main/src/plugins-data.json")
        .then((r) => r.json())
        .then((data) => {
          setPlugins(Array.isArray(data) ? data : []);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }, []);

    const filtered = plugins.filter((p) => {
      const matchesSearch =
        (p.name && p.name.toLowerCase().includes(search.toLowerCase())) ||
        (p.description && p.description.toLowerCase().includes(search.toLowerCase())) ||
        (Array.isArray(p.authors) && p.authors.some((a) => a.toLowerCase().includes(search.toLowerCase())));
      const matchesStatus = filter === "all" || p.status === filter;
      return matchesSearch && matchesStatus;
    });

    const styles = StyleSheet.create({
      container: { flex: 1, backgroundColor: "#1e1f22", padding: 12 },
      title: { fontSize: 20, fontWeight: "bold", color: "#ffffff", marginBottom: 4 },
      subtitle: { fontSize: 13, color: "#949ba4", marginBottom: 12 },
      searchBar: {
        backgroundColor: "#2b2d31",
        color: "#ffffff",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        marginBottom: 10,
        fontSize: 14,
      },
      filterRow: { flexDirection: "row", marginBottom: 14, gap: 6 },
      filterBtn: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 6, backgroundColor: "#2b2d31" },
      filterActive: { backgroundColor: "#5865f2" },
      filterText: { color: "#949ba4", fontSize: 12, fontWeight: "bold" },
      filterTextActive: { color: "#ffffff" },
      card: { backgroundColor: "#2b2d31", borderRadius: 8, padding: 12, marginBottom: 10 },
      cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
      cardTitle: { fontSize: 16, fontWeight: "bold", color: "#ffffff", flex: 1 },
      badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, marginLeft: 8 },
      badgeWorking: { backgroundColor: "#23a55a22", borderWidth: 1, borderColor: "#23a55a" },
      badgeWarning: { backgroundColor: "#f0b23222", borderWidth: 1, borderColor: "#f0b232" },
      badgeBroken: { backgroundColor: "#f23f4322", borderWidth: 1, borderColor: "#f23f43" },
      badgeText: { fontSize: 11, fontWeight: "bold" },
      badgeTextWorking: { color: "#23a55a" },
      badgeTextWarning: { color: "#f0b232" },
      badgeTextBroken: { color: "#f23f43" },
      authors: { fontSize: 12, color: "#949ba4", marginBottom: 6 },
      desc: { fontSize: 13, color: "#dbdee1", marginBottom: 10, lineHeight: 18 },
      btnRow: { flexDirection: "row", gap: 8 },
      btnPrimary: { backgroundColor: "#5865f2", paddingVertical: 8, paddingHorizontal: 14, borderRadius: 6, flex: 1, alignItems: "center" },
      btnInstalled: { backgroundColor: "#23a55a" },
      btnText: { color: "#ffffff", fontWeight: "bold", fontSize: 13 },
      btnSecondary: { backgroundColor: "#35373c", paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6, alignItems: "center" },
      btnSecondaryText: { color: "#dbdee1", fontSize: 13 },
    });

    return React.createElement(
      ScrollView,
      { style: styles.container },
      React.createElement(Text, { style: styles.title }, "Revenge Plugin Store"),
      React.createElement(Text, { style: styles.subtitle }, `Browse and 1-click install from ${plugins.length || "160+"} community plugins`),
      React.createElement(TextInput, {
        style: styles.searchBar,
        placeholder: "Search plugins, authors, or keywords...",
        placeholderTextColor: "#80848e",
        value: search,
        onChangeText: setSearch,
      }),
      React.createElement(
        View,
        { style: styles.filterRow },
        ["all", "working", "warning", "broken"].map((f) =>
          React.createElement(
            TouchableOpacity,
            {
              key: f,
              style: [styles.filterBtn, filter === f && styles.filterActive],
              onPress: () => setFilter(f),
            },
            React.createElement(
              Text,
              { style: [styles.filterText, filter === f && styles.filterTextActive] },
              f === "all" ? "All" : f === "working" ? "✓ Working" : f === "warning" ? "⚠ Warning" : "✕ Broken"
            )
          )
        )
      ),
      loading
        ? React.createElement(ActivityIndicator, { size: "large", color: "#5865f2", style: { marginTop: 40 } })
        : filtered.map((plugin) =>
            React.createElement(
              View,
              { key: plugin.name + plugin.link, style: styles.card },
              React.createElement(
                View,
                { style: styles.cardHeader },
                React.createElement(Text, { style: styles.cardTitle }, plugin.name),
                plugin.status &&
                  React.createElement(
                    View,
                    {
                      style: [
                        styles.badge,
                        plugin.status === "working"
                          ? styles.badgeWorking
                          : plugin.status === "warning"
                          ? styles.badgeWarning
                          : styles.badgeBroken,
                      ],
                    },
                    React.createElement(
                      Text,
                      {
                        style: [
                          styles.badgeText,
                          plugin.status === "working"
                            ? styles.badgeTextWorking
                            : plugin.status === "warning"
                            ? styles.badgeTextWarning
                            : styles.badgeTextBroken,
                        ],
                      },
                      plugin.status.toUpperCase()
                    )
                  )
              ),
              React.createElement(
                Text,
                { style: styles.authors },
                `by ${Array.isArray(plugin.authors) ? plugin.authors.join(", ") : plugin.authors || "Unknown"}`
              ),
              React.createElement(Text, { style: styles.desc }, plugin.description || "No description provided."),
              React.createElement(
                View,
                { style: styles.btnRow },
                React.createElement(
                  TouchableOpacity,
                  {
                    style: [styles.btnPrimary, installedMap[plugin.link] && styles.btnInstalled],
                    onPress: async () => {
                      if (!plugin.link) return;
                      const ok = await installPluginItem(plugin.link, plugin.name);
                      if (ok) setInstalledMap((m) => ({ ...m, [plugin.link]: true }));
                    },
                  },
                  React.createElement(
                    Text,
                    { style: styles.btnText },
                    installedMap[plugin.link] ? "✓ Installed" : "Install Plugin"
                  )
                ),
                React.createElement(
                  TouchableOpacity,
                  {
                    style: styles.btnSecondary,
                    onPress: () => {
                      if (plugin.link && RN.Clipboard && RN.Clipboard.setString) {
                        RN.Clipboard.setString(plugin.link);
                        if (vendetta.ui?.toasts?.showToast) vendetta.ui.toasts.showToast("Link copied!");
                      }
                    },
                  },
                  React.createElement(Text, { style: styles.btnSecondaryText }, "Copy Link")
                )
              )
            )
          )
    );
  }

  // =========================================================================
  // THEME STORE SCREEN (193 THEMES WITH 1-CLICK INSTALL)
  // =========================================================================
  function ThemeStoreScreen() {
    const React = getReact();
    const RN = getRN();
    const { ScrollView, View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet } = RN;

    const [themes, setThemes] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [search, setSearch] = React.useState("");
    const [installedMap, setInstalledMap] = React.useState({});

    React.useEffect(() => {
      fetch("https://raw.githubusercontent.com/Purple-EyeZ/Plugins-List/main/src/themes-data.json")
        .then((r) => r.json())
        .then((data) => {
          setThemes(Array.isArray(data) ? data : []);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }, []);

    const filtered = themes.filter((t) => {
      return (
        (t.name && t.name.toLowerCase().includes(search.toLowerCase())) ||
        (t.description && t.description.toLowerCase().includes(search.toLowerCase())) ||
        (Array.isArray(t.authors) && t.authors.some((a) => a.toLowerCase().includes(search.toLowerCase())))
      );
    });

    const styles = StyleSheet.create({
      container: { flex: 1, backgroundColor: "#1e1f22", padding: 12 },
      title: { fontSize: 20, fontWeight: "bold", color: "#ffffff", marginBottom: 4 },
      subtitle: { fontSize: 13, color: "#949ba4", marginBottom: 12 },
      searchBar: {
        backgroundColor: "#2b2d31",
        color: "#ffffff",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        marginBottom: 10,
        fontSize: 14,
      },
      card: { backgroundColor: "#2b2d31", borderRadius: 8, padding: 12, marginBottom: 10 },
      cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
      cardTitle: { fontSize: 16, fontWeight: "bold", color: "#ffffff" },
      authors: { fontSize: 12, color: "#949ba4", marginBottom: 6 },
      desc: { fontSize: 13, color: "#dbdee1", marginBottom: 10, lineHeight: 18 },
      btnRow: { flexDirection: "row", gap: 8 },
      btnPrimary: { backgroundColor: "#eb459e", paddingVertical: 8, paddingHorizontal: 14, borderRadius: 6, flex: 1, alignItems: "center" },
      btnInstalled: { backgroundColor: "#23a55a" },
      btnText: { color: "#ffffff", fontWeight: "bold", fontSize: 13 },
      btnSecondary: { backgroundColor: "#35373c", paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6, alignItems: "center" },
      btnSecondaryText: { color: "#dbdee1", fontSize: 13 },
    });

    return React.createElement(
      ScrollView,
      { style: styles.container },
      React.createElement(Text, { style: styles.title }, "Revenge Theme Store"),
      React.createElement(Text, { style: styles.subtitle }, `Browse and install from ${themes.length || "190+"} custom themes`),
      React.createElement(TextInput, {
        style: styles.searchBar,
        placeholder: "Search themes by name or author...",
        placeholderTextColor: "#80848e",
        value: search,
        onChangeText: setSearch,
      }),
      loading
        ? React.createElement(ActivityIndicator, { size: "large", color: "#eb459e", style: { marginTop: 40 } })
        : filtered.map((theme) =>
            React.createElement(
              View,
              { key: theme.name + theme.link, style: styles.card },
              React.createElement(
                View,
                { style: styles.cardHeader },
                React.createElement(Text, { style: styles.cardTitle }, theme.name)
              ),
              React.createElement(
                Text,
                { style: styles.authors },
                `by ${Array.isArray(theme.authors) ? theme.authors.join(", ") : theme.authors || "Unknown"}`
              ),
              React.createElement(Text, { style: styles.desc }, theme.description || "No description available."),
              React.createElement(
                View,
                { style: styles.btnRow },
                React.createElement(
                  TouchableOpacity,
                  {
                    style: [styles.btnPrimary, installedMap[theme.link] && styles.btnInstalled],
                    onPress: async () => {
                      if (!theme.link) return;
                      const ok = await installThemeItem(theme.link, theme.name);
                      if (ok) setInstalledMap((m) => ({ ...m, [theme.link]: true }));
                    },
                  },
                  React.createElement(
                    Text,
                    { style: styles.btnText },
                    installedMap[theme.link] ? "✓ Installed" : "Install Theme"
                  )
                ),
                React.createElement(
                  TouchableOpacity,
                  {
                    style: styles.btnSecondary,
                    onPress: () => {
                      if (theme.link && RN.Clipboard && RN.Clipboard.setString) {
                        RN.Clipboard.setString(theme.link);
                        if (vendetta.ui?.toasts?.showToast) vendetta.ui.toasts.showToast("Theme link copied!");
                      }
                    },
                  },
                  React.createElement(Text, { style: styles.btnSecondaryText }, "Copy Link")
                )
              )
            )
          )
    );
  }

  // =========================================================================
  // SETTINGS SCREEN COMPONENT (FULL CONFIG MENU)
  // =========================================================================
  function SettingsScreen() {
    const React = getReact();
    const RN = getRN();
    const { ScrollView, View, Text, Switch, TouchableOpacity, StyleSheet } = RN;
    const storage = getStorage();
    const [, setTick] = React && React.useState ? React.useState(0) : [0, () => {}];
    const [viewMode, setViewMode] = React.useState("settings");

    function toggle(key) {
      storage[key] = !storage[key];
      setTick((t) => t + 1);
      try {
        if (vendetta && vendetta.ui && vendetta.ui.toasts && vendetta.ui.toasts.showToast) {
          vendetta.ui.toasts.showToast(
            `${key} is now ${storage[key] ? "Enabled" : "Disabled"}`
          );
        }
      } catch (_) {}
    }

    if (viewMode === "plugins") {
      return React.createElement(
        View,
        { style: { flex: 1, backgroundColor: "#1e1f22" } },
        React.createElement(
          TouchableOpacity,
          {
            style: { padding: 12, backgroundColor: "#2b2d31", borderBottomWidth: 1, borderBottomColor: "#35373c" },
            onPress: () => setViewMode("settings"),
          },
          React.createElement(Text, { style: { color: "#5865f2", fontWeight: "bold" } }, "← Back to QoL Settings")
        ),
        React.createElement(PluginStoreScreen)
      );
    }

    if (viewMode === "themes") {
      return React.createElement(
        View,
        { style: { flex: 1, backgroundColor: "#1e1f22" } },
        React.createElement(
          TouchableOpacity,
          {
            style: { padding: 12, backgroundColor: "#2b2d31", borderBottomWidth: 1, borderBottomColor: "#35373c" },
            onPress: () => setViewMode("settings"),
          },
          React.createElement(Text, { style: { color: "#5865f2", fontWeight: "bold" } }, "← Back to QoL Settings")
        ),
        React.createElement(ThemeStoreScreen)
      );
    }

    const styles = StyleSheet.create({
      container: { flex: 1, padding: 16, backgroundColor: "#1e1f22" },
      title: { fontSize: 20, fontWeight: "bold", color: "#ffffff", marginBottom: 4 },
      subtitle: { fontSize: 13, color: "#949ba4", marginBottom: 16 },
      storeBtnGroup: { gap: 10, marginBottom: 20 },
      storeBtn: { backgroundColor: "#5865f2", padding: 14, borderRadius: 8, alignItems: "center" },
      storeBtnAlt: { backgroundColor: "#eb459e" },
      storeBtnText: { color: "#ffffff", fontWeight: "bold", fontSize: 15 },
      sectionHeader: { fontSize: 13, fontWeight: "bold", color: "#949ba4", textTransform: "uppercase", marginBottom: 8, marginTop: 8 },
      row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#2b2d31" },
      label: { fontSize: 15, color: "#ffffff", fontWeight: "500" },
      desc: { fontSize: 12, color: "#949ba4", marginTop: 2, lineHeight: 16 },
    });

    const options = [
      // Media & Compression
      { key: "noCompression", label: "Zero Compression (Original Quality)", desc: "Upload photos & videos with exact original file size, resolution, and bitrate" },
      { key: "fileSizeOnPicker", label: "File Size on Picker (MSMA)", desc: "Show file sizes directly on thumbnails in the media picker" },
      { key: "altMediaPicker", label: "Alternative Media Picker (fres)", desc: "Use Android system gallery picker when attaching media" },
      { key: "mediaViewing", label: "Hold-Down Avatar/Banner to Download", desc: "Long-press user avatar or banner to download 4096px source directly to gallery" },

      // Chat & Messaging
      { key: "useSystemEmoji", label: "Use System Emoji (nexpid)", desc: "Replaces Twemoji with native Android system emojis in messages" },
      { key: "freeStickers", label: "Free Stickers (aliernfrog & Cristiandis)", desc: "Send stickers from any server without Nitro (embeds direct sticker media)" },
      { key: "silentTyping", label: "Silent / Incognito Typing", desc: "Never broadcast 'typing...' indicator in any DM or server" },
      { key: "messageLogger", label: "Message Logger", desc: "Keep deleted messages (*deleted*) and show previous text on edits (*old text*)" },
      { key: "cleanUrls", label: "Clean URLs (Tracker Stripper)", desc: "Remove tracking params (utm, si, igshid, fbclid) when sending links" },
      { key: "exactTimestamps", label: "Exact Timestamps", desc: "Show hours, minutes, and seconds on chat messages" },

      // Voice & Calls
      { key: "antiCall", label: "Anti-Accidental Call", desc: "Confirm before starting voice or video calls" },
      { key: "noBandwidthKick", label: "No Bandwidth Kick (mafu & meqativ)", desc: "Disable idle bandwidth disconnects when alone in a voice channel or call" },
      { key: "bluetoothAudioFix", label: "Bluetooth Audio Fix (Narwhal & redstonekasi)", desc: "Prevent Discord from enabling low-quality handsfree mode in calls" },
      { key: "backgroundAudio", label: "Background Audio", desc: "Keep voice messages and MP3 attachments playing in background" },

      // Interface & Navigation
      { key: "platformIndicators", label: "Platform Indicators (MSMA)", desc: "Show Desktop, Mobile, and Web presence badges next to usernames" },
      { key: "openExternalBrowser", label: "Open in External Browser", desc: "Bypass in-app webview for all clicked links" },
    ];

    return React.createElement(
      ScrollView,
      { style: styles.container },
      React.createElement(Text, { style: styles.title }, "QoL All-in-One Settings"),
      React.createElement(Text, { style: styles.subtitle }, "Configure integrated plugins or browse the Revenge stores below"),
      React.createElement(
        View,
        { style: styles.storeBtnGroup },
        React.createElement(
          TouchableOpacity,
          { style: styles.storeBtn, onPress: () => setViewMode("plugins") },
          React.createElement(Text, { style: styles.storeBtnText }, "📦 Open Plugin Store (166 Plugins)")
        ),
        React.createElement(
          TouchableOpacity,
          { style: [styles.storeBtn, styles.storeBtnAlt], onPress: () => setViewMode("themes") },
          React.createElement(Text, { style: styles.storeBtnText }, "🎨 Open Theme Store (193 Themes)")
        )
      ),
      React.createElement(Text, { style: styles.sectionHeader }, "Integrated Plugins & Tweaks"),
      options.map((opt) =>
        React.createElement(
          View,
          { key: opt.key, style: styles.row },
          React.createElement(
            View,
            { style: { flex: 1, paddingRight: 8 } },
            React.createElement(Text, { style: styles.label }, opt.label),
            React.createElement(Text, { style: styles.desc }, opt.desc)
          ),
          React.createElement(Switch, {
            value: !!storage[opt.key],
            onValueChange: () => toggle(opt.key),
            thumbColor: storage[opt.key] ? "#5865f2" : "#80848e",
            trackColor: { false: "#4e5058", true: "#7983f5" },
          })
        )
      )
    );
  }

  // Plugin Lifecycle Object
  const plugin = {
    start: () => plugin.onLoad(),
    stop: () => plugin.onUnload(),

    settings: SettingsScreen,
    SettingsComponent: SettingsScreen,

    onLoad: () => {
      try {
        if (!vendetta) {
          console.warn("[QoL-AIO] Vendetta/Revenge global instance not available.");
          return;
        }

        const { metro, patcher, ui } = vendetta;
        const { findByProps, findByName } = metro || {};
        const { before, instead, after } = patcher || {};
        const RN = getRN();
        const React = getReact();
        const storage = getStorage();

        for (const [key, val] of Object.entries(defaultSettings)) {
          if (storage[key] === undefined) storage[key] = val;
        }

        // Show confirmation toast
        try {
          if (ui && ui.toasts && ui.toasts.showToast) {
            ui.toasts.showToast(
              "QoL All-in-One Activated",
              ui.toasts.getAssetIDByName ? ui.toasts.getAssetIDByName("ic_settings_24px") : undefined
            );
          }
        } catch (_) {}

        // =========================================================================
        // 0. INJECT PLUGIN STORE & THEME STORE BUTTONS DIRECTLY BELOW FONTS
        // =========================================================================
        try {
          const registeredSections = ui?.settings?.registeredSections;
          if (registeredSections && typeof registeredSections === "object") {
            const pluginStoreRow = {
              key: "REVENGE_PLUGIN_STORE",
              title: () => "Plugin Store",
              render: () => Promise.resolve({ default: PluginStoreScreen }),
              useTrailing: () => "Browse",
            };
            const themeStoreRow = {
              key: "REVENGE_THEME_STORE",
              title: () => "Theme Store",
              render: () => Promise.resolve({ default: ThemeStoreScreen }),
              useTrailing: () => "Browse",
            };

            for (const [sectionName, items] of Object.entries(registeredSections)) {
              if (!Array.isArray(items)) continue;
              const isTargetSection =
                sectionName.toLowerCase().includes("bunny") ||
                sectionName.toLowerCase().includes("revenge") ||
                sectionName.toLowerCase().includes("vendetta") ||
                items.some((i) => i.key && i.key.includes("FONTS"));

              if (isTargetSection) {
                const fontIdx = items.findIndex((i) => i.key && i.key.includes("FONTS"));
                const insertIdx = fontIdx !== -1 ? fontIdx + 1 : items.length;

                const existingPIdx = items.findIndex((i) => i.key === "REVENGE_PLUGIN_STORE");
                if (existingPIdx !== -1) items.splice(existingPIdx, 1);
                const existingTIdx = items.findIndex((i) => i.key === "REVENGE_THEME_STORE");
                if (existingTIdx !== -1) items.splice(existingTIdx, 1);

                items.splice(insertIdx, 0, pluginStoreRow, themeStoreRow);

                unpatches.push(() => {
                  const pIdx = items.findIndex((i) => i.key === "REVENGE_PLUGIN_STORE");
                  if (pIdx !== -1) items.splice(pIdx, 1);
                  const tIdx = items.findIndex((i) => i.key === "REVENGE_THEME_STORE");
                  if (tIdx !== -1) items.splice(tIdx, 1);
                });
              }
            }
            console.log("[QoL-AIO] Injected Plugin Store & Theme Store below Fonts.");
          }
        } catch (e) {
          console.warn("[QoL-AIO] Error injecting settings rows:", e);
        }

        // Helper: Download Media directly to Android Gallery
        const MediaManager = findByProps("downloadMediaAsset");
        function downloadMedia(url, label = "Media") {
          if (!url) return;
          try {
            if (RN.Vibration && typeof RN.Vibration.vibrate === "function") {
              RN.Vibration.vibrate(50);
            }
            if (RN.Clipboard && typeof RN.Clipboard.setString === "function") {
              RN.Clipboard.setString(url);
            }

            if (MediaManager && typeof MediaManager.downloadMediaAsset === "function") {
              MediaManager.downloadMediaAsset(url, 1);
              if (ui && ui.toasts && ui.toasts.showToast) {
                ui.toasts.showToast(
                  `${label} saved to gallery!`,
                  ui.toasts.getAssetIDByName ? ui.toasts.getAssetIDByName("ic_download_24px") : undefined
                );
              }
              return;
            }
          } catch (e) {
            console.warn("[QoL-AIO] MediaManager error:", e);
          }

          const Linking = findByProps("openURL", "canOpenURL") || RN.Linking;
          if (Linking && Linking.openURL) {
            Linking.openURL(url);
          }
        }

        // =========================================================================
        // 1. HOLD DOWN (LONG-PRESS) USER PFP & BANNER TO DOWNLOAD
        // =========================================================================
        try {
          const HeaderAvatar = findByName("HeaderAvatar", false);
          const { Pressable } = findByProps("Button", "Text", "View") || {};

          if (HeaderAvatar && after) {
            unpatches.push(
              after("default", HeaderAvatar, ([args], res) => {
                if (!storage.mediaViewing || !res || !args) return res;
                const user = args.user;
                const guildId = args.guildId;
                const avatarUrl = getUserAvatarUrl(user, guildId);

                if (avatarUrl) {
                  attachLongPress(res, () => {
                    downloadMedia(avatarUrl, "Avatar");
                  });
                }
                return res;
              })
            );
          }

          const bannerComponents = [
            findByName("ProfileBanner", false),
            findByName("UserBanner", false),
            findByName("UserProfileBanner", false),
            findByName("HeaderBanner", false),
          ].filter(Boolean);

          bannerComponents.forEach((Comp) => {
            unpatches.push(
              after("default", Comp, (args, res) => {
                if (!storage.mediaViewing || !res) return res;
                const bannerUrl = extractBannerUrl(args);

                if (!Pressable || !React) return res;

                return React.createElement(
                  Pressable,
                  {
                    onLongPress: () => {
                      if (bannerUrl) {
                        downloadMedia(bannerUrl, "Banner");
                      } else {
                        if (RN.Vibration && typeof RN.Vibration.vibrate === "function") {
                          RN.Vibration.vibrate(30);
                        }
                        if (ui && ui.toasts && ui.toasts.showToast) {
                          ui.toasts.showToast("This user does not have a custom banner.");
                        }
                      }
                    },
                  },
                  res
                );
              })
            );
          });
          console.log("[QoL-AIO] Hold-down media download hooks active.");
        } catch (e) {
          console.warn("[QoL-AIO] Error patching avatar/banner download:", e);
        }

        // =========================================================================
        // 2. ZERO COMPRESSION UPLOADS (ORIGINAL FILE SIZE, BITRATE, RESOLUTION)
        // =========================================================================
        try {
          const CloudUploadModule = findByProps("CloudUpload");
          const CloudUpload = CloudUploadModule?.CloudUpload || CloudUploadModule?.default || CloudUploadModule;

          if (CloudUpload && CloudUpload.prototype && instead) {
            unpatches.push(
              instead("reactNativeCompressAndExtractData", CloudUpload.prototype, function (args) {
                if (!storage.noCompression) {
                  return CloudUpload.prototype.reactNativeCompressAndExtractData.apply(this, args);
                }
                const media = args[0];
                return new Promise((resolve) => {
                  media.reactNativeFilePrepped = true;
                  if (media.preCompressionSize) {
                    media.currentSize = media.preCompressionSize;
                    media.postCompressionSize = media.preCompressionSize;
                  } else {
                    media.postCompressionSize = 1000;
                    media.preCompressionSize = 1000;
                    media.currentSize = 1000;
                  }

                  if (media.mimeType === "image/png" && !media.filename.toLowerCase().endsWith(".png")) {
                    media.filename = media.filename + ".png";
                  }
                  if (media.mimeType === "image/jpg" && !(media.filename.toLowerCase().endsWith(".jpg") || media.filename.toLowerCase().endsWith(".jpeg"))) {
                    media.filename = media.filename + ".jpg";
                  }
                  resolve(media);
                });
              })
            );
            console.log("[QoL-AIO] NoCompression hook active.");
          }
        } catch (e) {
          console.warn("[QoL-AIO] Error patching CloudUpload:", e);
        }

        // =========================================================================
        // 3. USE SYSTEM EMOJI (BY NEXPID)
        // =========================================================================
        try {
          const chatModule =
            (RN.TurboModuleRegistry && (RN.TurboModuleRegistry.get("NativeChatModule") || RN.TurboModuleRegistry.get("DCDChatManager"))) ||
            RN.NativeModules?.NativeChatModule ||
            RN.NativeModules?.DCDChatManager ||
            (window.nativeModuleProxy && (window.nativeModuleProxy.NativeChatModule || window.nativeModuleProxy.DCDChatManager)) ||
            findByProps("updateRows");

          if (chatModule && before) {
            unpatches.push(
              before("updateRows", chatModule, (args) => {
                if (!storage.useSystemEmoji || !args || typeof args[1] !== "string") return;
                try {
                  const rows = JSON.parse(args[1]);
                  for (const row of rows) {
                    if (row && row.type === 1 && row.message && row.message.content) {
                      row.message.content = iterateSystemEmoji(row.message.content);
                    }
                  }
                  args[1] = JSON.stringify(rows);
                } catch (_) {}
              })
            );
            console.log("[QoL-AIO] Use System Emoji hook active.");
          }
        } catch (e) {
          console.warn("[QoL-AIO] Error patching System Emoji:", e);
        }

        // =========================================================================
        // 4. FILE SIZE ON PICKER (BY MSMA)
        // =========================================================================
        try {
          const findByDisplayName = metro?.findByDisplayName;
          const PressableModule = (findByDisplayName && findByDisplayName("Pressable", false)) || findByProps("Pressable");
          const PressableTarget = PressableModule?.default || PressableModule;
          if (PressableTarget && before) {
            unpatches.push(
              before("type", PressableTarget, (args) => {
                if (!storage.fileSizeOnPicker || !args || !args[0]) return;
                const props = args[0];
                if (props.modifiedByFileSizeOnPicker) return;

                if (props?.children?.[0]?.props?.localImageSource || (Array.isArray(props?.children) && props.children.some((c) => c?.props?.localImageSource))) {
                  props.modifiedByFileSizeOnPicker = true;
                  props.originalChildren = props.children;
                  let fileUrl = null;
                  const img = findInReactTree(props.originalChildren, (m) => m?.props?.localImageSource?.uri);
                  if (img && img.props && img.props.localImageSource) {
                    fileUrl = img.props.localImageSource.uri;
                  }
                  if (!fileUrl) return;

                  props.children = React.createElement(
                    RN.View,
                    { style: { position: "relative" } },
                    props.originalChildren,
                    React.createElement(
                      RN.View,
                      {
                        style: {
                          backgroundColor: "#1e1f22b0",
                          borderRadius: 4,
                          paddingHorizontal: 4,
                          paddingVertical: 2,
                          position: "absolute",
                          top: 3,
                          left: 3,
                        },
                      },
                      React.createElement(SizeTag, { url: fileUrl })
                    )
                  );
                }
              })
            );
            console.log("[QoL-AIO] FileSizeOnPicker hook active.");
          }
        } catch (e) {
          console.warn("[QoL-AIO] Error patching FileSizeOnPicker:", e);
        }

        // =========================================================================
        // 5. NO BANDWIDTH KICK (BY MAFU, MEQATIV :3)
        // =========================================================================
        try {
          const TimeoutModule = findByProps("Timeout");
          if (TimeoutModule && TimeoutModule.Timeout && TimeoutModule.Timeout.prototype && before) {
            unpatches.push(
              before("start", TimeoutModule.Timeout.prototype, (args) => {
                if (!storage.noBandwidthKick) return;
                if (args && args[1] && (args[1].name === "disconnect" || String(args[1]).includes("disconnect"))) {
                  args[1] = () => {};
                }
                return args;
              })
            );
            console.log("[QoL-AIO] NoBandwidthKick hook active.");
          }
        } catch (e) {
          console.warn("[QoL-AIO] Error patching Timeout:", e);
        }

        // =========================================================================
        // 6. FREE STICKERS (BY ALIERNFROG, CRISTIANDIS)
        // =========================================================================
        try {
          const NitroModule = findByProps("canUseAnimatedEmojis");
          if (NitroModule && instead) {
            const checkName = NitroModule.canUseCustomStickersEverywhere ? "canUseCustomStickersEverywhere" : "canUseStickersEverywhere";
            if (NitroModule[checkName]) {
              unpatches.push(
                instead(checkName, NitroModule, (args, orig) => {
                  if (storage.freeStickers) return true;
                  return orig.apply(NitroModule, args);
                })
              );
            }
          }

          const StickerUtils = findByProps("getStickerSendability");
          if (StickerUtils && instead) {
            const SENDABLE = (StickerUtils.StickerSendability && StickerUtils.StickerSendability.SENDABLE) ?? 0;
            unpatches.push(
              instead("getStickerSendability", StickerUtils, (args, orig) => {
                if (storage.freeStickers) return SENDABLE;
                return orig.apply(StickerUtils, args);
              })
            );
            if (StickerUtils.isSendableSticker) {
              unpatches.push(
                instead("isSendableSticker", StickerUtils, (args, orig) => {
                  if (storage.freeStickers) return true;
                  return orig.apply(StickerUtils, args);
                })
              );
            }
          }

          const MessageModule = findByProps("sendMessage", "receiveMessage");
          const StickersStore = (metro?.findByStoreName && metro.findByStoreName("StickersStore")) || findByProps("getStickerById");
          const ChannelStore = (metro?.findByStoreName && metro.findByStoreName("ChannelStore")) || findByProps("getChannel");
          const UserStore = (metro?.findByStoreName && metro.findByStoreName("UserStore")) || findByProps("getCurrentUser");

          function isStickerExternalOrNoNitro(sticker, channelId) {
            if (!sticker) return false;
            if (!sticker.guild_id) return false;
            const currentUser = UserStore?.getCurrentUser ? UserStore.getCurrentUser() : null;
            if (currentUser && currentUser.premiumType) return false;
            const channel = ChannelStore?.getChannel ? ChannelStore.getChannel(channelId) : null;
            if (channel && channel.guild_id === sticker.guild_id) return false;
            return true;
          }

          if (MessageModule && MessageModule.sendStickers && instead) {
            unpatches.push(
              instead("sendStickers", MessageModule, (args, orig) => {
                if (!storage.freeStickers) return orig.apply(MessageModule, args);
                const [channelId, stickerIds, _, extra] = args;
                const stickers = (stickerIds || [])
                  .map((id) => (StickersStore?.getStickerById ? StickersStore.getStickerById(id) : null))
                  .filter(Boolean);

                const externalStickers = stickers.filter((s) => isStickerExternalOrNoNitro(s, channelId));
                if (!externalStickers.length) {
                  return orig.apply(MessageModule, args);
                }

                for (const s of externalStickers) {
                  const ext = s.format_type === 4 ? "gif" : "png";
                  const url = `https://media.discordapp.net/stickers/${s.id}.${ext}?size=160`;
                  MessageModule.sendMessage(channelId, { content: url }, null, extra);
                }
              })
            );
            console.log("[QoL-AIO] FreeStickers hook active.");
          }
        } catch (e) {
          console.warn("[QoL-AIO] Error patching FreeStickers:", e);
        }

        // =========================================================================
        // 7. ALTERNATIVE MEDIA PICKER (BY FRES)
        // =========================================================================
        try {
          const ImagePickerModule = findByProps("launchImageLibrary");
          const AttachFileModule = findByProps("handleAttachFile");
          const SelectedChannelStore = (metro?.findByStoreName && metro.findByStoreName("SelectedChannelStore")) || findByProps("getChannelId");

          if (AttachFileModule && ImagePickerModule && instead) {
            unpatches.push(
              instead("handleAttachFile", AttachFileModule, (args, orig) => {
                if (!storage.altMediaPicker) {
                  return orig.apply(AttachFileModule, args);
                }
                const channelId = (SelectedChannelStore && SelectedChannelStore.getChannelId && SelectedChannelStore.getChannelId()) || (args && args[0]);
                ImagePickerModule.launchImageLibrary(
                  { mediaType: "mixed" },
                  (res) => {
                    if (!res || !res.assets) return;
                    const assets = res.assets.slice(0, 10);
                    assets.forEach((asset) => {
                      if (AttachFileModule.handleSelectKeyboardItem) {
                        AttachFileModule.handleSelectKeyboardItem(
                          channelId,
                          {
                            node: {
                              image: {
                                playableDuration: 0,
                                height: asset.height,
                                filename: asset.fileName || "attachment",
                                width: asset.width,
                                mimeType: asset.type,
                                uri: asset.uri,
                              },
                              type: asset.type && asset.type.startsWith("video") ? "ALAssetTypeVideo" : "ALAssetTypePhoto",
                            },
                          },
                          false,
                          { target: 0 },
                          undefined
                        );
                      }
                    });
                  }
                );
              })
            );
            console.log("[QoL-AIO] AltMediaPicker hook active.");
          }
        } catch (e) {
          console.warn("[QoL-AIO] Error patching AltMediaPicker:", e);
        }

        // =========================================================================
        // 8. BLUETOOTH AUDIO FIX (BY NARWHAL, REDSTONEKASI)
        // =========================================================================
        try {
          const audioManager =
            (RN.TurboModuleRegistry && (RN.TurboModuleRegistry.get("NativeAudioManagerModule") || RN.TurboModuleRegistry.get("RTNAudioManager"))) ||
            RN.NativeModules?.NativeAudioManagerModule ||
            RN.NativeModules?.RTNAudioManager ||
            (window.nativeModuleProxy && (window.nativeModuleProxy.NativeAudioManagerModule || window.nativeModuleProxy.RTNAudioManager));

          if (audioManager && instead) {
            unpatches.push(
              instead("setCommunicationModeOn", audioManager, (args, orig) => {
                if (storage.bluetoothAudioFix) {
                  return;
                }
                return orig.apply(audioManager, args);
              })
            );
            console.log("[QoL-AIO] Bluetooth Audio Fix hook active.");
          }
        } catch (e) {
          console.warn("[QoL-AIO] Error patching Bluetooth Audio:", e);
        }

        // =========================================================================
        // 9. PLATFORM INDICATORS (BY MSMA)
        // =========================================================================
        try {
          const UserRowComp = findByName ? findByName("UserRow") : null;
          const GuildMemberRowComp = findByName ? findByName("GuildMemberRow") : null;
          [UserRowComp, GuildMemberRowComp].filter(Boolean).forEach((Row) => {
            unpatches.push(
              after("default", Row, ([props], res) => {
                if (!storage.platformIndicators || !props || !props.user || !res) return res;
                const userId = props.user.id;
                if (findInReactTree(res, (c) => c?.key === "QoLPlatformIcons")) return res;
                return React.createElement(
                  RN.View,
                  { key: "QoLPlatformIcons", style: { flexDirection: "row", alignItems: "center" } },
                  res,
                  React.createElement(StatusIconsComp, { userId })
                );
              })
            );
          });

          const findByTypeName = metro?.findByTypeName;
          const MessagesItemChannelContent = findByTypeName ? findByTypeName("MessagesItemChannelContent") : null;
          if (MessagesItemChannelContent && after) {
            unpatches.push(
              after("type", MessagesItemChannelContent, (args, res) => {
                if (!storage.platformIndicators) return res;
                const channel = args && args[0]?.channel;
                if (channel && channel.recipients && channel.recipients.length === 1) {
                  const userId = channel.recipients[0];
                  if (findInReactTree(res, (m) => m?.key === "QoLPlatformIconsDM")) return res;
                  const nameContainer = findInReactTree(res, (m) => m?.props?.children && Array.isArray(m.props.children) && m.props.children.some((h) => h?.props?.ellipsizeMode));
                  if (nameContainer && nameContainer.props && nameContainer.props.children) {
                    const orig = nameContainer.props.children[0];
                    nameContainer.props.children = React.createElement(
                      RN.View,
                      { key: "QoLPlatformIconsDM", style: { flexDirection: "row", alignItems: "center" } },
                      orig,
                      React.createElement(StatusIconsComp, { userId })
                    );
                  }
                }
                return res;
              })
            );
          }
          console.log("[QoL-AIO] PlatformIndicators hook active.");
        } catch (e) {
          console.warn("[QoL-AIO] Error patching PlatformIndicators:", e);
        }

        // =========================================================================
        // 10. SILENT / INCOGNITO TYPING (WITH CONFIG TOGGLE)
        // =========================================================================
        try {
          const Typing = findByProps("startTyping");
          if (Typing && instead) {
            unpatches.push(
              instead("startTyping", Typing, (args, orig) => {
                if (storage.silentTyping) return;
                return orig.apply(Typing, args);
              })
            );
            unpatches.push(
              instead("stopTyping", Typing, (args, orig) => {
                if (storage.silentTyping) return;
                return orig.apply(Typing, args);
              })
            );
            console.log("[QoL-AIO] Silent Typing hook active.");
          }
        } catch (e) {
          console.warn("[QoL-AIO] Error patching Typing:", e);
        }

        // =========================================================================
        // 11. ANTI-ACCIDENTAL CALLS (CONFIRMATION DIALOG)
        // =========================================================================
        try {
          const CallActions = findByProps("call", "ring") || findByProps("startCall");
          const alerts = (ui && ui.alerts) || findByProps("showConfirmationAlert");
          if (CallActions && CallActions.call && instead) {
            unpatches.push(
              instead("call", CallActions, (args, orig) => {
                if (!storage.antiCall) return orig.apply(CallActions, args);
                const [, isVideo] = args;
                const showConfirm = alerts.showConfirmationAlert || alerts.show;
                if (typeof showConfirm === "function") {
                  showConfirm({
                    title: isVideo ? "Start Video Call?" : "Start Voice Call?",
                    content: "Are you sure you want to start this call?",
                    confirmText: "Call",
                    cancelText: "Cancel",
                    onConfirm: () => orig.apply(CallActions, args),
                  });
                } else {
                  orig.apply(CallActions, args);
                }
              })
            );
            console.log("[QoL-AIO] Anti-Accidental Call hook active.");
          }
        } catch (e) {
          console.warn("[QoL-AIO] Error patching CallActions:", e);
        }

        // =========================================================================
        // 12. OPEN IN EXTERNAL BROWSER DIRECTLY
        // =========================================================================
        try {
          const Linking = findByProps("openURL", "canOpenURL") || RN.Linking;
          const InAppBrowser = findByProps("openInAppBrowser", "openCustomTabs");
          if (InAppBrowser && instead) {
            if (typeof InAppBrowser.openInAppBrowser === "function") {
              unpatches.push(
                instead("openInAppBrowser", InAppBrowser, (args, orig) => {
                  if (!storage.openExternalBrowser) return orig.apply(InAppBrowser, args);
                  const url = args[0];
                  if (url && Linking && Linking.openURL) Linking.openURL(url);
                })
              );
            }
            if (typeof InAppBrowser.openCustomTabs === "function") {
              unpatches.push(
                instead("openCustomTabs", InAppBrowser, (args, orig) => {
                  if (!storage.openExternalBrowser) return orig.apply(InAppBrowser, args);
                  const url = args[0];
                  if (url && Linking && Linking.openURL) Linking.openURL(url);
                })
              );
            }
            console.log("[QoL-AIO] External Browser hook active.");
          }
        } catch (e) {
          console.warn("[QoL-AIO] Error patching InAppBrowser:", e);
        }

        // =========================================================================
        // 13. CLEAN URLS & TRACKER REMOVAL
        // =========================================================================
        try {
          const MessageActions = findByProps("sendMessage", "receiveMessage");
          if (MessageActions && MessageActions.sendMessage && before) {
            unpatches.push(
              before("sendMessage", MessageActions, (args) => {
                const msg = args[1];
                if (msg && msg.content && storage.cleanUrls) {
                  msg.content = stripUrlTrackers(msg.content);
                }
              })
            );
            console.log("[QoL-AIO] Clean URLs hook active.");
          }
        } catch (e) {
          console.warn("[QoL-AIO] Error patching MessageActions:", e);
        }

        // =========================================================================
        // 14. BACKGROUND AUDIO (VOICE NOTES & MP3 ATTACHMENTS)
        // =========================================================================
        try {
          const AudioManager = (RN.NativeModules && (RN.NativeModules.AudioManager || RN.NativeModules.RTNAudioManager));
          if (AudioManager && AudioManager.setCommunicationModeOn && instead) {
            unpatches.push(
              instead("setCommunicationModeOn", AudioManager, (args, orig) => {
                if (!storage.backgroundAudio) return orig.apply(AudioManager, args);
              })
            );
            console.log("[QoL-AIO] Background Audio hook active.");
          }
        } catch (e) {
          console.warn("[QoL-AIO] Error patching AudioManager:", e);
        }

        // =========================================================================
        // 15. MESSAGE LOGGER (DELETED & EDITED MESSAGE RETENTION)
        // =========================================================================
        try {
          const ChannelMessages = findByProps("_channelMessages");
          const RowManager = findByName("RowManager");
          const MessageRecordUtils = findByProps("updateMessageRecord", "createMessageRecord");
          const MessageRecord = findByName("MessageRecord", false);
          const FluxDispatcher = (metro.common && metro.common.FluxDispatcher) || findByProps("dispatch", "subscribe");

          if (FluxDispatcher && before) {
            unpatches.push(
              before("dispatch", FluxDispatcher, ([event]) => {
                if (!event || !storage.messageLogger) return;

                // DELETED MESSAGES
                if (event.type === "MESSAGE_DELETE") {
                  if (event.__qol_cleanup) return;
                  const channel = ChannelMessages?._channelMessages?.[event.channelId] || (ChannelMessages?.get && ChannelMessages.get(event.channelId));
                  const message = channel?.get ? channel.get(event.id) : channel?._array?.find((m) => m.id === event.id);
                  if (!message || message.state === "SEND_FAILED" || (message.author && message.author.id === "1")) return;

                  event.type = "MESSAGE_UPDATE";
                  event.__qol_deleted = true;
                  event.message = {
                    id: event.id,
                    channel_id: event.channelId,
                    content: message.content ? `*(deleted)* ${message.content}` : "*(deleted message)*",
                    edited_timestamp: "deleted",
                    state: "SENT",
                    __qol_deleted: true,
                  };
                  message.__qol_deleted = true;
                  message.content = event.message.content;

                  if (channel && channel._array) {
                    const idx = channel._array.findIndex((m) => m.id === event.id);
                    if (idx !== -1) {
                      channel._array[idx].__qol_deleted = true;
                      channel._array[idx].content = event.message.content;
                    }
                  }

                  event.channel = {
                    id: event.channelId,
                    guild_id: event.guildId,
                  };

                  event.messages = [{
                    id: event.id,
                    channel_id: event.channelId,
                    content: event.message.content,
                    state: "SENT",
                    __qol_deleted: true,
                  }];
                }

                // EDITED MESSAGES
                if (event.type === "MESSAGE_UPDATE" && event.message && event.message.content) {
                  const channelId = event.message.channel_id || event.message.channelId;
                  const channel = ChannelMessages?._channelMessages?.[channelId] || (ChannelMessages?.get && ChannelMessages.get(channelId));
                  const existing = channel?.get ? channel.get(event.message.id) : channel?._array?.find((m) => m.id === event.message.id);

                  if (existing && existing.content && existing.content !== event.message.content && !event.message.__qol_edit_applied) {
                    const originalContent = existing.content.replace(/^\*\(deleted\)\*\s*/, "");
                    event.message.content = `*${originalContent}*\n${event.message.content}`;
                    event.message.__qol_edit_applied = true;
                  }
                }
              })
            );
          }

          if (MessageRecordUtils && MessageRecordUtils.createMessageRecord && after) {
            unpatches.push(
              after("createMessageRecord", MessageRecordUtils, function ([message], record) {
                if (message && record) {
                  record.__qol_deleted = message.__qol_deleted;
                }
              })
            );
          }

          if (MessageRecord && MessageRecord.default && after) {
            unpatches.push(
              after("default", MessageRecord, ([props], record) => {
                if (props && record) {
                  record.__qol_deleted = !!props.__qol_deleted;
                }
              })
            );
          }

          if (RowManager && RowManager.prototype && after) {
            unpatches.push(
              after("generate", RowManager.prototype, ([data], row) => {
                if (!row || !data || data.rowType !== 1 || !storage.messageLogger) return;

                if (data.message && data.message.__qol_deleted) {
                  row.message.edited = "deleted";
                  row.backgroundHighlight = row.backgroundHighlight || {};
                  row.backgroundHighlight.backgroundColor = RN.processColor ? RN.processColor("#da373c22") : "#da373c22";
                  row.backgroundHighlight.gutterColor = RN.processColor ? RN.processColor("#da373cff") : "#da373cff";
                }

                // Exact Timestamps (with seconds)
                if (storage.exactTimestamps && row.message && row.message.timestamp) {
                  try {
                    const ts = row.message.timestamp;
                    const date = typeof ts === "string" || typeof ts === "number" ? new Date(ts) : (ts && ts._d ? ts._d : null);
                    if (date && !isNaN(date.getTime())) {
                      row.message.timestampFormatted = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
                    }
                  } catch (_) {}
                }
              })
            );
          }

          console.log("[QoL-AIO] Message Logger hooks active.");
        } catch (e) {
          console.warn("[QoL-AIO] Error patching Message Logger:", e);
        }

        console.log("[QoL-AIO] All hooks loaded.");
      } catch (err) {
        console.error("[QoL-AIO] Initialization failed:", err);
      }
    },

    onUnload: () => {
      for (const unpatch of unpatches) {
        try {
          unpatch();
        } catch (_) {}
      }
      unpatches = [];
      console.log("[QoL-AIO] Unloaded and all patches cleaned up.");
    },
  };

  plugin.default = plugin;

  if (typeof module !== "undefined" && module.exports) {
    module.exports = plugin;
    module.exports.default = plugin;
    module.exports.settings = SettingsScreen;
    module.exports.SettingsComponent = SettingsScreen;
  }
  if (typeof exports !== "undefined") {
    exports.default = plugin;
    exports.settings = SettingsScreen;
    exports.SettingsComponent = SettingsScreen;
  }

  return plugin;
})(typeof vendetta !== "undefined" ? vendetta : undefined);
