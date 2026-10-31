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

  // =========================================================================
  // PLATFORM INDICATORS (BY MSMA)
  // =========================================================================
  const PLATFORM_SVG_PATHS = {
    desktop: "M4 2.5c-1.103 0-2 .897-2 2v11c0 1.104.897 2 2 2h7v2H7v2h10v-2h-4v-2h7c1.103 0 2-.896 2-2v-11c0-1.103-.897-2-2-2H4Zm16 2v9H4v-9h16Z",
    web: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93Zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39Z",
    mobile: "M15.5 1h-8A2.5 2.5 0 0 0 5 3.5v17A2.5 2.5 0 0 0 7.5 23h8a2.5 2.5 0 0 0 2.5-2.5v-17A2.5 2.5 0 0 0 15.5 1zm-4 21c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm4.5-4H7V4h9v14z",
    embedded: "M5.79335761,5 L18.2066424,5 C19.7805584,5 21.0868816,6.21634264 21.1990185,7.78625885 L21.8575059,17.0050826 C21.9307825,18.0309548 21.1585512,18.9219909 20.132679,18.9952675 C20.088523,18.9984215 20.0442685,19 20,19 C18.8245863,19 17.8000084,18.2000338 17.5149287,17.059715 L17,15 L7,15 L6.48507125,17.059715 C6.19999155,18.2000338 5.1754137,19 4,19 C2.97151413,19 2.13776159,18.1662475 2.13776159,17.1377616 C2.13776159,17.0934931 2.1393401,17.0492386 2.1424941,17.0050826 L2.80098151,7.78625885 C2.91311838,6.21634264 4.21944161,5 5.79335761,5 Z",
    vr: "M15.55 5a5.5 5.5 0 0 1 5.15 3.67h.3a2 2 0 0 1 2 2v3.18a2 2 0 0 1-2 1.99h-.2A4.54 4.54 0 0 1 16.55 19a4.45 4.45 0 0 1-3.6-1.83 1.2 1.2 0 0 0-1.9 0 4.44 4.44 0 0 1-3.9 1.82 4.54 4.54 0 0 1-3.94-3.15H3a2 2 0 0 1-2-2v-3.18c0-1.1.9-1.99 2-1.99h.3A5.5 5.5 0 0 1 8.46 5h7.09Zm-7.1 2C6.6 7 5.06 8.5 4.97 10.41l-.02.66v3.18c0 1.43 1.05 2.66 2.34 2.74.85.06 1.63-.32 2.14-1.01a3.2 3.2 0 0 1 2.57-1.3c1 0 1.97.48 2.57 1.3.5.69 1.3 1.08 2.14 1.01 1.3-.08 2.34-1.31 2.34-2.74l-.02-3.84a3.54 3.54 0 0 0-3.49-3.43H8.45Z",
  };

  const STATUS_COLORS = {
    online: "#23a55a",
    idle: "#f0b232",
    dnd: "#f23f43",
    offline: "#80848e",
  };

  function StatusIconSingle({ platform, color, size = 15 }) {
    const React = getReact();
    const RN = getRN();
    const metro = vendetta?.metro;
    const SvgModule = (metro?.findByProps && metro.findByProps("SvgXml")) || (metro?.findByName && metro.findByName("Svg", false));
    const Svg = SvgModule?.Svg || SvgModule?.default || SvgModule;
    const Path = SvgModule?.Path;

    if (Svg && Path && PLATFORM_SVG_PATHS[platform]) {
      return React.createElement(
        RN.View,
        { style: { width: size, height: size, marginRight: 3, justifyContent: "center", alignItems: "center" } },
        React.createElement(
          Svg,
          { width: size, height: size, viewBox: "0 0 24 24", fill: color },
          React.createElement(Path, { d: PLATFORM_SVG_PATHS[platform], fill: color })
        )
      );
    }

    const getAsset = vendetta?.ui?.assets?.getAssetIDByName || vendetta?.ui?.toasts?.getAssetIDByName;
    const assetId = getAsset
      ? platform === "mobile"
        ? getAsset("ic_mobile_device")
        : platform === "web"
        ? getAsset("ic_globe_24px")
        : getAsset("ic_monitor_24px")
      : null;

    if (assetId) {
      return React.createElement(RN.Image, {
        style: { width: size, height: size, tintColor: color, marginRight: 3 },
        source: assetId,
      });
    }

    return React.createElement(RN.View, {
      style: {
        width: Math.max(6, size - 7),
        height: Math.max(6, size - 7),
        borderRadius: size / 2,
        backgroundColor: color,
        marginRight: 3,
      },
    });
  }

  let presenceCache = null;
  let presenceCacheTime = 0;

  function getCachedPresenceState() {
    const metro = vendetta?.metro;
    const now = Date.now();
    if (!presenceCache || now - presenceCacheTime > 3000) {
      const PresenceStore = (metro?.findByStoreName && metro.findByStoreName("PresenceStore")) || (metro?.findByProps && metro.findByProps("getState"));
      presenceCache = PresenceStore?.getState ? PresenceStore.getState() : null;
      presenceCacheTime = now;
    }
    return presenceCache;
  }

  function getUserPlatformStatuses(userId) {
    if (!userId) return null;
    const metro = vendetta?.metro;
    try {
      const UserStore = (metro?.findByStoreName && metro.findByStoreName("UserStore")) || (metro?.findByProps && metro.findByProps("getCurrentUser"));
      const SessionsStore = (metro?.findByStoreName && metro.findByStoreName("SessionsStore")) || (metro?.findByProps && metro.findByProps("getSessions"));
      const currentUserId = UserStore?.getCurrentUser?.()?.id;

      if (userId === currentUserId && SessionsStore?.getSessions) {
        const sessions = SessionsStore.getSessions();
        if (sessions && typeof sessions === "object") {
          const res = {};
          Object.values(sessions).forEach((s) => {
            if (s?.clientInfo?.client && s.clientInfo.client !== "unknown") {
              res[s.clientInfo.client] = s.status || "online";
            }
          });
          if (Object.keys(res).length > 0) return res;
        }
      }

      // Check PresenceStore
      const PresenceStore =
        (metro?.findByStoreName && metro.findByStoreName("PresenceStore")) ||
        (metro?.findByProps && metro.findByProps("getState", "getStatus"));

      const state = PresenceStore?.getState ? PresenceStore.getState() : getCachedPresenceState();

      let clientStatuses = null;
      if (PresenceStore?.getClientStatuses) {
        clientStatuses = PresenceStore.getClientStatuses(userId);
      }
      if (!clientStatuses && state?.clientStatuses?.[userId]) {
        clientStatuses = state.clientStatuses[userId];
      }

      const res = {};
      if (clientStatuses && typeof clientStatuses === "object") {
        Object.keys(clientStatuses).forEach((k) => {
          if (clientStatuses[k] && clientStatuses[k] !== "offline") {
            res[k] = clientStatuses[k];
          }
        });
      }

      const userStatus = PresenceStore?.getStatus ? PresenceStore.getStatus(userId) : state?.statuses?.[userId];
      const isMobile =
        (typeof PresenceStore?.isMobileOnline === "function" && PresenceStore.isMobileOnline(userId)) ||
        (state?.mobileOnlineUsers && (state.mobileOnlineUsers[userId] || (typeof state.mobileOnlineUsers.has === "function" && state.mobileOnlineUsers.has(userId)))) ||
        (state?.mobileStatuses && state.mobileStatuses[userId]);

      if (isMobile && userStatus && userStatus !== "offline") {
        res.mobile = userStatus;
      }

      // Fallback: if user is active (online, idle, dnd) but no specific platform was listed in clientStatuses
      if (Object.keys(res).length === 0 && userStatus && userStatus !== "offline") {
        if (isMobile) {
          res.mobile = userStatus;
        } else {
          res.desktop = userStatus;
        }
      }

      return Object.keys(res).length > 0 ? res : null;
    } catch (_) {
      return null;
    }
  }

  function PresenceUpdatedContainer({ userId, size = 15 }) {
    const React = getReact();
    const RN = getRN();
    const [tick, setTick] = React.useState(0);

    React.useEffect(() => {
      const FluxDispatcher =
        (vendetta?.metro?.common && vendetta.metro.common.FluxDispatcher) ||
        (vendetta?.metro && vendetta.metro.findByProps("dispatch", "subscribe"));

      if (FluxDispatcher && typeof FluxDispatcher.subscribe === "function") {
        const onPresence = (e) => {
          if (!e) return;
          if (e.updates && Array.isArray(e.updates)) {
            if (e.updates.some((u) => u?.user?.id === userId)) {
              presenceCache = null;
              setTick((t) => t + 1);
            }
          } else if (e.user?.id === userId || e.userId === userId) {
            presenceCache = null;
            setTick((t) => t + 1);
          } else {
            presenceCache = null;
            setTick((t) => t + 1);
          }
        };
        FluxDispatcher.subscribe("PRESENCE_UPDATES", onPresence);
        FluxDispatcher.subscribe("PRESENCE_UPDATE", onPresence);
        return () => {
          try {
            FluxDispatcher.unsubscribe("PRESENCE_UPDATES", onPresence);
            FluxDispatcher.unsubscribe("PRESENCE_UPDATE", onPresence);
          } catch (_) {}
        };
      }
    }, [userId]);

    const statuses = getUserPlatformStatuses(userId);
    if (!statuses) return null;
    const platforms = Object.keys(statuses);
    if (!platforms.length) return null;

    return React.createElement(
      RN.View,
      {
        style: {
          flexDirection: "row",
          alignItems: "center",
          marginLeft: 4,
        },
      },
      platforms.map((p) => {
        const color = STATUS_COLORS[statuses[p]] || STATUS_COLORS.online;
        return React.createElement(StatusIconSingle, {
          key: p,
          platform: p,
          color: color,
          size: size,
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

          if (CloudUpload && CloudUpload.prototype && after) {
            unpatches.push(
              after("reactNativeCompressAndExtractData", CloudUpload.prototype, function (args, res) {
                if (!storage.noCompression) return res;
                const media = this;
                if (!media) return res;

                return new Promise((resolve) => {
                  try {
                    media.reactNativeFilePrepped = true;
                    if (media.preCompressionSize) {
                      media.currentSize = media.preCompressionSize;
                      media.postCompressionSize = media.preCompressionSize;
                    } else {
                      media.postCompressionSize = 1000;
                      media.preCompressionSize = 1000;
                      media.currentSize = 1000;
                    }

                    if (media.mimeType === "image/png" && typeof media.filename === "string" && !media.filename.toLowerCase().endsWith(".png")) {
                      media.filename = media.filename + ".png";
                    }
                    if (media.mimeType === "image/jpg" && typeof media.filename === "string" && !(media.filename.toLowerCase().endsWith(".jpg") || media.filename.toLowerCase().endsWith(".jpeg"))) {
                      media.filename = media.filename + ".jpg";
                    }
                  } catch (_) {}
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
          const getModuleWithImportedPath =
            window.revenge?.discord?.utils?.modules?.finders?.getModuleWithImportedPath ||
            window.revenge?.discord?.utils?.finders?.getModuleWithImportedPath;

          function hookModule(importedPath, metroGetter, beforeFn, afterFn) {
            let patched = false;
            function doPatch(ns) {
              if (patched || !ns) return;
              if (ns.default) {
                const target = ns.default;
                if (typeof target === "function") {
                  patched = true;
                  if (beforeFn && before) unpatches.push(before("default", ns, beforeFn));
                  if (afterFn && after) unpatches.push(after("default", ns, afterFn));
                  console.log(`[QoL-AIO] PlatformIndicators hooked ${importedPath || "module"} on default`);
                  return;
                }
                if (target && typeof target === "object" && typeof target.type === "function") {
                  patched = true;
                  if (beforeFn && before) unpatches.push(before("type", target, beforeFn));
                  if (afterFn && after) unpatches.push(after("type", target, afterFn));
                  console.log(`[QoL-AIO] PlatformIndicators hooked ${importedPath || "module"} on type`);
                  return;
                }
              }

              if (typeof ns === "object" && typeof ns.type === "function") {
                patched = true;
                if (beforeFn && before) unpatches.push(before("type", ns, beforeFn));
                if (afterFn && after) unpatches.push(after("type", ns, afterFn));
                console.log(`[QoL-AIO] PlatformIndicators hooked ${importedPath || "module"} on type`);
                return;
              }

              const candidates = [
                "UsernameWithEffects",
                "UserRow",
                "GuildMemberRow",
                "MessagesItemChannelContent",
                "MessagesItemChannel",
                "MessagesItemChannelFast",
                "MessagesItemChannelFlash",
                "MessagesItemChannelLegend",
              ];
              for (const name of candidates) {
                if (ns[name]) {
                  const comp = ns[name];
                  if (typeof comp === "function") {
                    patched = true;
                    if (beforeFn && before) unpatches.push(before(name, ns, beforeFn));
                    if (afterFn && after) unpatches.push(after(name, ns, afterFn));
                    console.log(`[QoL-AIO] PlatformIndicators hooked ${importedPath || "module"} member ${name}`);
                  } else if (comp && typeof comp === "object" && typeof comp.type === "function") {
                    patched = true;
                    if (beforeFn && before) unpatches.push(before("type", comp, beforeFn));
                    if (afterFn && after) unpatches.push(after("type", comp, afterFn));
                    console.log(`[QoL-AIO] PlatformIndicators hooked ${importedPath || "module"} member ${name} on type`);
                  }
                }
              }
            }

            if (getModuleWithImportedPath && importedPath) {
              try {
                getModuleWithImportedPath(importedPath, (mod) => doPatch(mod));
              } catch (_) {}
            }

            if (metroGetter) {
              try {
                const mod = metroGetter();
                if (mod) doPatch(mod);
              } catch (_) {}
            }
          }

          // A. Hook UsernameWithEffects (all usernames in chat, DMs, headers, profiles)
          hookModule(
            "modules/display_name_styles/native/UsernameWithEffects.tsx",
            () => {
              const mod = findByProps("AVERAGE_FONT_WIDTH_RATIO");
              return mod?.default || mod?.UsernameWithEffects || mod;
            },
            null,
            (args, res) => {
              if (!storage.platformIndicators || !res) return res;
              const userId = args?.[0]?.userId;
              if (!userId) return res;
              if (findInReactTree(res, (c) => c?.key === "QoLPlatformIconsWrap" || c?.key === "QoLPI")) return res;

              return React.createElement(
                RN.View,
                {
                  key: "QoLPlatformIconsWrap",
                  style: {
                    flexDirection: "row",
                    alignItems: "center",
                  },
                },
                res,
                React.createElement(PresenceUpdatedContainer, {
                  key: "QoLPI",
                  userId: userId,
                  size: 14,
                })
              );
            }
          );

          // B. Hook UserRow (Member list in channels / tabs v2)
          hookModule(
            "modules/main_tabs_v2/native/shared_components/user_list/UserRow.tsx",
            () => findByProps("UserRowModes"),
            null,
            (args, res) => {
              if (!storage.platformIndicators || !res) return res;
              // Check if indicators were already added to this row
              if (
                findInReactTree(
                  res,
                  (c) =>
                    c?.key === "QoLPlatformIconsWrap" ||
                    c?.key === "QoLPI" ||
                    c?.key === "QoLPlatformIconsUserRow" ||
                    c?.key === "QoLPI_TV2"
                )
              ) {
                return res;
              }

              const userId = args?.[0]?.user?.id || findInReactTree(res, (m) => m?.props?.userId)?.props?.userId;
              if (!userId) return res;

              const nameContainer = findInReactTree(
                res,
                (m) => m?.props?.children && Array.isArray(m.props.children) && m.props.children.some((h) => h?.props?.variant === "text-md/semibold")
              );
              if (nameContainer && Array.isArray(nameContainer.props?.children)) {
                const idx = nameContainer.props.children.findIndex((h) => h?.props?.variant === "text-md/semibold");
                if (idx !== -1) {
                  nameContainer.props.children.splice(
                    idx + 1,
                    0,
                    React.createElement(PresenceUpdatedContainer, {
                      key: "QoLPlatformIconsUserRow",
                      userId: userId,
                      size: 14,
                    })
                  );
                  return res;
                }
              }

              if (res.props && res.props.label) {
                const origLabel = res.props.label;
                res.props.label = React.createElement(
                  RN.View,
                  {
                    key: "QoLPlatformIconsUserRow",
                    style: { flexDirection: "row", alignItems: "center" },
                  },
                  origLabel,
                  React.createElement(PresenceUpdatedContainer, { userId: userId, size: 14 })
                );
              }
              return res;
            }
          );

          // C. Hook findByTypeNameAll("UserRow") as additional fallback for Vendetta/Bunny
          if (metro?.findByTypeNameAll) {
            try {
              const rows = metro.findByTypeNameAll("UserRow");
              rows.forEach((UserRow) => {
                unpatches.push(
                  after("type", UserRow, ([{ user }], res) => {
                    if (!storage.platformIndicators || !user || !res || !res.props) return res;
                    if (
                      findInReactTree(
                        res,
                        (c) =>
                          c?.key === "QoLPlatformIconsWrap" ||
                          c?.key === "QoLPI" ||
                          c?.key === "QoLPlatformIconsUserRow" ||
                          c?.key === "QoLPI_TV2"
                      )
                    ) {
                      return res;
                    }
                    res.props.label = React.createElement(
                      RN.View,
                      {
                        key: "QoLPI_TV2",
                        style: { flexDirection: "row", alignItems: "center" },
                      },
                      res.props.label,
                      React.createElement(PresenceUpdatedContainer, { userId: user.id, size: 14 })
                    );
                  })
                );
              });
            } catch (_) {}
          }

          // D. Hook GuildMemberRow (server member list)
          const Rows = findByProps("GuildMemberRow");
          if (Rows?.GuildMemberRow && after) {
            unpatches.push(
              after("type", Rows.GuildMemberRow, ([{ user }], res) => {
                if (!storage.platformIndicators || !user || !res) return res;
                if (findInReactTree(res, (c) => c?.key === "QoLPlatformIconsGMR")) return res;
                const row = findInReactTree(res, (c) => c?.props?.style?.flexDirection === "row");
                if (row && row.props && Array.isArray(row.props.children)) {
                  row.props.children.splice(
                    2,
                    0,
                    React.createElement(
                      RN.View,
                      { key: "QoLPlatformIconsGMR", style: { flexDirection: "row", alignItems: "center", marginLeft: 4 } },
                      React.createElement(PresenceUpdatedContainer, { userId: user.id, size: 14 })
                    )
                  );
                }
              })
            );
          }

          // E. Hook DisplayName & DefaultName (profiles)
          const DisplayName = findByProps("DisplayName");
          if (DisplayName && after) {
            const key = DisplayName.DisplayName ? "DisplayName" : "default";
            unpatches.push(
              after(key, DisplayName, ([props], res) => {
                if (!storage.platformIndicators || !props || !props.user || !res) return res;
                const userId = props.user.id;
                if (findInReactTree(res, (m) => m?.key === "QoLPlatformIconsDN")) return res;
                const row = findInReactTree(res, (m) => m?.props?.style?.flexDirection === "row");
                if (row && Array.isArray(row.props?.children)) {
                  row.props.children.push(
                    React.createElement(PresenceUpdatedContainer, {
                      key: "QoLPlatformIconsDN",
                      userId: userId,
                      size: 15,
                    })
                  );
                }
                return res;
              })
            );
          }

          // F. Hook ChannelHeader (DM top bar)
          const ChannelHeader = findByName ? findByName("ChannelHeader", false) : null;
          if (ChannelHeader && after) {
            unpatches.push(
              after("default", ChannelHeader, (args, res) => {
                if (!storage.platformIndicators || !res) return res;
                const childType = res.type?.type || res.type;
                if (childType?.name === "PrivateChannelHeader" && after) {
                  unpatches.push(
                    after("type", res.type, (args, headerRes) => {
                      const userId = findInReactTree(headerRes, (m) => m?.props?.user?.id)?.props?.user?.id;
                      if (!userId) return headerRes;
                      if (findInReactTree(headerRes, (m) => m?.key === "QoLPlatformIconsHeader")) return headerRes;

                      const titleContainer = findInReactTree(
                        headerRes,
                        (m) => m?.props?.children && Array.isArray(m.props.children) && m.props.children.some((c) => c?.props?.variant?.includes("heading"))
                      );
                      if (titleContainer && Array.isArray(titleContainer.props.children)) {
                        titleContainer.props.children.push(
                          React.createElement(PresenceUpdatedContainer, {
                            key: "QoLPlatformIconsHeader",
                            userId: userId,
                            size: 16,
                          })
                        );
                      }
                      return headerRes;
                    })
                  );
                }
                return res;
              })
            );
          }

          // G. Remove Default Mobile Status Icon (matches MSMA plugin option)
          const StatusComp = findByName ? findByName("Status", false) : null;
          if (StatusComp && before) {
            unpatches.push(
              before("default", StatusComp, (args) => {
                if (storage.platformIndicators && args && args[0]) {
                  args[0].isMobileOnline = false;
                }
                return args;
              })
            );
          }

          // H. Hook DM List Channels (Tabs v2 / messages tab 1-on-1 direct messages)
          function patchDMChannelRow(args, res) {
            if (!storage.platformIndicators || !res) return res;

            try {
              const arg0 = args?.[0];
              const channel = arg0?.channel || arg0;

              // Only show for 1-on-1 direct messages
              const isDM =
                channel?.type === 1 ||
                (typeof channel?.isDM === "function" && channel.isDM()) ||
                (Array.isArray(channel?.recipients) && channel.recipients.length === 1);

              if (channel && channel.type !== undefined && !isDM) return res;

              let userId =
                (Array.isArray(channel?.recipients) && channel.recipients[0]) ||
                (typeof channel?.getRecipientId === "function" && channel.getRecipientId()) ||
                (Array.isArray(channel?.rawRecipients) && channel.rawRecipients[0]?.id) ||
                channel?.recipientId;

              if (!userId) {
                const userNode = findInReactTree(res, (m) => m?.props?.user?.id || m?.props?.userId);
                userId = userNode?.props?.user?.id || userNode?.props?.userId;
              }

              if (!userId) return res;
              if (findInReactTree(res, (m) => m?.key === "QoLPlatformIconsDM")) return res;

              // Locate name container inside channel list item
              const nameContainer = findInReactTree(
                res,
                (m) =>
                  m?.props?.children &&
                  (Array.isArray(m.props.children)
                    ? m.props.children.some(
                        (h) =>
                          h?.props?.ellipsizeMode ||
                          (typeof h?.props?.variant === "string" &&
                            (h.props.variant.includes("channel-title") || h.props.variant.includes("semibold")))
                      )
                    : m.props.children?.props?.ellipsizeMode ||
                      (typeof m.props.children?.props?.variant === "string" &&
                        (m.props.children.props.variant.includes("channel-title") ||
                          m.props.children.props.variant.includes("semibold"))))
              );

              if (nameContainer && Array.isArray(nameContainer.props.children)) {
                const idx = nameContainer.props.children.findIndex(
                  (h) =>
                    h?.props?.ellipsizeMode ||
                    (typeof h?.props?.variant === "string" &&
                      (h.props.variant.includes("channel-title") || h.props.variant.includes("semibold")))
                );
                const insertIdx = idx !== -1 ? idx + 1 : nameContainer.props.children.length;
                nameContainer.props.children.splice(
                  insertIdx,
                  0,
                  React.createElement(
                    RN.View,
                    {
                      key: "QoLPlatformIconsDM",
                      style: { flexDirection: "row", alignItems: "center", marginLeft: 4 },
                    },
                    React.createElement(PresenceUpdatedContainer, { userId: userId, size: 14 })
                  )
                );
              } else if (nameContainer && nameContainer.props && nameContainer.props.children) {
                const orig = nameContainer.props.children;
                nameContainer.props.children = React.createElement(
                  RN.View,
                  {
                    key: "QoLPlatformIconsDM",
                    style: { flexDirection: "row", alignItems: "center" },
                  },
                  orig,
                  React.createElement(PresenceUpdatedContainer, { userId: userId, size: 14 })
                );
              } else {
                // Secondary fallback: find the text node itself
                const textNode = findInReactTree(
                  res,
                  (m) =>
                    m?.props?.ellipsizeMode ||
                    (typeof m?.props?.variant === "string" &&
                      (m.props.variant.includes("channel-title") || m.props.variant.includes("semibold")))
                );
                if (textNode && textNode.props) {
                  if (Array.isArray(textNode.props.children)) {
                    textNode.props.children.push(
                      React.createElement(PresenceUpdatedContainer, {
                        key: "QoLPlatformIconsDM",
                        userId: userId,
                        size: 14,
                      })
                    );
                  } else if (textNode.props.children) {
                    textNode.props.children = [
                      textNode.props.children,
                      React.createElement(
                        RN.View,
                        {
                          key: "QoLPlatformIconsDM",
                          style: { flexDirection: "row", alignItems: "center", marginLeft: 4 },
                        },
                        React.createElement(PresenceUpdatedContainer, { userId: userId, size: 14 })
                      ),
                    ];
                  }
                }
              }
            } catch (err) {
              console.warn("[QoL-AIO] Error in patchDMChannelRow:", err);
            }
            return res;
          }

          // 1. Hook MessagesItemChannelContent
          hookModule(
            "modules/main_tabs_v2/native/tabs/messages/items/channel/MessagesItemChannelContent.tsx",
            () =>
              (metro?.findByTypeName && metro.findByTypeName("MessagesItemChannelContent")) ||
              (metro?.find &&
                metro.find(
                  (m) =>
                    m?.default?.name === "MessagesItemChannelContent" ||
                    m?.name === "MessagesItemChannelContent" ||
                    m?.type?.name === "MessagesItemChannelContent"
                )),
            null,
            patchDMChannelRow
          );

          // 2. Hook MessagesItemChannel components (Fast, Flash, Legend)
          hookModule(
            "modules/main_tabs_v2/native/tabs/messages/items/MessagesItemChannel.tsx",
            () =>
              findByProps("MessagesItemChannelFast", "MessagesItemChannelFlash") ||
              findByProps("MessagesItemChannelLegend"),
            null,
            patchDMChannelRow
          );

          // 3. Hook Pressable for Tabs v2 DM list rows
          try {
            const PressableModule =
              (metro?.findByDisplayName && metro.findByDisplayName("Pressable", false)) || findByProps("Pressable");
            const PressableTarget =
              PressableModule?.default?.type || PressableModule?.default || PressableModule?.Pressable;
            if (PressableTarget && before) {
              const hookTarget =
                typeof PressableTarget.render === "function"
                  ? PressableTarget
                  : typeof PressableTarget === "function"
                  ? PressableModule
                  : null;
              const hookKey = typeof PressableTarget.render === "function" ? "render" : "default";
              if (hookTarget) {
                unpatches.push(
                  before(hookKey, hookTarget, (args) => {
                    if (!storage.platformIndicators || !args || !args[0]) return;
                    const props = args[0];
                    if (props?.accessibilityRole !== "button") return;
                    if (findInReactTree(props, (m) => m?.key === "QoLPlatformIconsDM" || m?.key === "DMTabsV2DMList-v2")) return;

                    try {
                      // Verify this is a 1-on-1 DM channel row
                      const userNode = findInReactTree(props, (m) => m?.props?.user?.id && !m?.props?.guildId);
                      const userId = userNode?.props?.user?.id;
                      if (!userId) return;

                      const isGuild = findInReactTree(props, (m) => m?.props?.guildId || m?.props?.channel?.guild_id);
                      if (isGuild) return;

                      // Strategy A: MSMA rowChildren path
                      const root = props?.children?.props?.children;
                      const rowChildren = root?.props?.children;
                      if (Array.isArray(rowChildren) && rowChildren.length >= 2) {
                        const nameArea = rowChildren[2]?.props?.children?.[0];
                        if (nameArea && nameArea.props && Array.isArray(nameArea.props.children)) {
                          if (!findInReactTree(nameArea.props.children, (c) => c?.key === "QoLPlatformIconsDM")) {
                            nameArea.props.children.splice(
                              1,
                              0,
                              React.createElement(PresenceUpdatedContainer, {
                                key: "QoLPlatformIconsDM",
                                userId: userId,
                                size: 14,
                              })
                            );
                            return;
                          }
                        }
                      }

                      // Strategy B: Name container search
                      const nameContainer = findInReactTree(
                        props,
                        (m) =>
                          m?.props?.children &&
                          (Array.isArray(m.props.children)
                            ? m.props.children.some(
                                (c) =>
                                  c?.props?.ellipsizeMode ||
                                  (typeof c?.props?.variant === "string" &&
                                    (c.props.variant.includes("channel-title") || c.props.variant.includes("semibold")))
                              )
                            : m.props.children?.props?.ellipsizeMode ||
                              (typeof m.props.children?.props?.variant === "string" &&
                                (m.props.children.props.variant.includes("channel-title") ||
                                  m.props.children.props.variant.includes("semibold"))))
                      );

                      if (nameContainer && Array.isArray(nameContainer.props.children)) {
                        const titleIdx = nameContainer.props.children.findIndex(
                          (c) =>
                            c?.props?.ellipsizeMode ||
                            (typeof c?.props?.variant === "string" &&
                              (c.props.variant.includes("channel-title") || c.props.variant.includes("semibold")))
                        );
                        const insertIdx = titleIdx !== -1 ? titleIdx + 1 : nameContainer.props.children.length;
                        nameContainer.props.children.splice(
                          insertIdx,
                          0,
                          React.createElement(PresenceUpdatedContainer, {
                            key: "QoLPlatformIconsDM",
                            userId: userId,
                            size: 14,
                          })
                        );
                        return;
                      }

                      // Strategy C: Target title Text element directly
                      const titleText = findInReactTree(
                        props,
                        (m) =>
                          m?.props?.variant === "redesign/channel-title/semibold" ||
                          (typeof m?.props?.variant === "string" && m.props.variant.includes("channel-title")) ||
                          (m?.props?.ellipsizeMode && m?.props?.numberOfLines === 1)
                      );
                      if (titleText && titleText.props) {
                        if (Array.isArray(titleText.props.children)) {
                          titleText.props.children.push(
                            React.createElement(PresenceUpdatedContainer, {
                              key: "QoLPlatformIconsDM",
                              userId: userId,
                              size: 14,
                            })
                          );
                        } else if (titleText.props.children) {
                          titleText.props.children = [
                            titleText.props.children,
                            React.createElement(
                              RN.View,
                              { key: "QoLPlatformIconsDM", style: { flexDirection: "row", alignItems: "center", marginLeft: 4 } },
                              React.createElement(PresenceUpdatedContainer, { userId: userId, size: 14 })
                            ),
                          ];
                        }
                      }
                    } catch (_) {}
                  })
                );
              }
            }
          } catch (_) {}

          console.log("[QoL-AIO] PlatformIndicators hooks active.");
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
