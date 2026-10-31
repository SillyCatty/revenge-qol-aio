(function (v) {
  "use strict";

  const vendetta = v || window.vendetta || window.revenge || window.bunny;
  let unpatches = [];

  // Default Settings State
  const defaultSettings = {
    silentTyping: true,
    antiCall: true,
    cleanUrls: true,
    openExternalBrowser: true,
    backgroundAudio: true,
    messageLogger: true,
    exactTimestamps: true,
    noCompression: true,
    mediaViewing: true,
  };

  function getStorage() {
    return (vendetta && vendetta.plugin && vendetta.plugin.storage) || defaultSettings;
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

  // Extract highest-resolution banner URL
  function getUserBannerUrl(user, bannerSource) {
    if (bannerSource && bannerSource.uri && typeof bannerSource.uri === "string") {
      return bannerSource.uri.replace(/(?:\?size=\d{3,4})?$/, "?size=4096").replace(".webp", ".png");
    }
    if (user && user.banner) {
      const ext = user.banner.startsWith("a_") ? "gif" : "png";
      return `https://cdn.discordapp.com/banners/${user.id}/${user.banner}.${ext}?size=4096`;
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

  // The Custom Settings Component
  function SettingsScreen() {
    const React = (vendetta && vendetta.metro && vendetta.metro.common && vendetta.metro.common.React) || window.React;
    const RN = (vendetta && vendetta.metro && vendetta.metro.common && vendetta.metro.common.ReactNative) || {};
    const { ScrollView, View, Text, Switch, StyleSheet } = RN;
    const storage = getStorage();
    const [, setTick] = React && React.useState ? React.useState(0) : [0, () => {}];

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

    if (!React || !View) return null;

    const styles = StyleSheet.create({
      container: { flex: 1, padding: 16, backgroundColor: "#1e1f22" },
      title: { fontSize: 20, fontWeight: "bold", color: "#ffffff", marginBottom: 16 },
      row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#2b2d31" },
      label: { fontSize: 16, color: "#ffffff" },
      desc: { fontSize: 12, color: "#949ba4", marginTop: 2 },
    });

    const options = [
      { key: "noCompression", label: "Zero Compression (Original Quality)", desc: "Upload photos & videos with exact original file size, resolution, and bitrate" },
      { key: "mediaViewing", label: "Hold-Down Avatar/Banner to Download", desc: "Hold down user avatar or banner to download 4096px source directly to gallery" },
      { key: "silentTyping", label: "Silent / Incognito Typing", desc: "Never broadcast 'typing...' in any DM or server" },
      { key: "messageLogger", label: "Message Logger", desc: "Keep deleted messages (*deleted*) and show previous text on edits (*old text*)" },
      { key: "antiCall", label: "Anti-Accidental Call", desc: "Confirm before starting voice or video calls" },
      { key: "openExternalBrowser", label: "Open in External Browser", desc: "Bypass in-app webview for all clicked links" },
      { key: "cleanUrls", label: "Clean URLs (Tracker Stripper)", desc: "Remove utm, si, igshid trackers when sending links" },
      { key: "backgroundAudio", label: "Background Audio", desc: "Keep voice messages and MP3s playing in background" },
      { key: "exactTimestamps", label: "Exact Timestamps", desc: "Show hours, minutes, and seconds on messages" },
    ];

    return React.createElement(
      ScrollView,
      { style: styles.container },
      React.createElement(Text, { style: styles.title }, "QoL All-in-One Settings"),
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

  const plugin = {
    // Both Revenge native lifecycle (start/stop) and Vendetta compatibility (onLoad/onUnload)
    start: () => plugin.onLoad(),
    stop: () => plugin.onUnload(),

    // Both Revenge native naming (SettingsComponent) and Vendetta naming (settings)
    settings: SettingsScreen,
    SettingsComponent: SettingsScreen,

    onLoad: () => {
      try {
        if (!vendetta) {
          console.warn("[QoL-AIO] Vendetta/Revenge global instance not available.");
          return;
        }

        const { metro, patcher, ui } = vendetta;
        const { findByProps, findByName, findByStoreName } = metro || {};
        const { before, instead, after } = patcher || {};
        const RN = (metro.common && metro.common.ReactNative) || {};
        const React = (metro.common && metro.common.React) || window.React;
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
          const ProfileBanner = findByName("ProfileBanner", false);
          const GuildIcon = findByName("GuildIcon");
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

          if (ProfileBanner && after) {
            unpatches.push(
              after("default", ProfileBanner, ([args], res) => {
                if (!storage.mediaViewing || !res || !args) return res;
                const bannerUrl = getUserBannerUrl(args.user, args.bannerSource);

                if (bannerUrl) {
                  attachLongPress(res, () => {
                    downloadMedia(bannerUrl, "Banner");
                  });
                }
                return res;
              })
            );
          }

          if (GuildIcon && GuildIcon.prototype && after && Pressable && React) {
            unpatches.push(
              after("render", GuildIcon.prototype, function (_, res) {
                if (!storage.mediaViewing || this.props?.size !== "XLARGE" || !this.props?.guild) return res;
                const guild = this.props.guild;
                const iconUrl = typeof guild.getIconURL === "function" ? guild.getIconURL(4096) : null;
                if (!iconUrl) return res;

                return React.createElement(
                  Pressable,
                  {
                    onPress: () => downloadMedia(iconUrl, "Server Icon"),
                    onLongPress: () => downloadMedia(iconUrl, "Server Icon"),
                  },
                  res
                );
              })
            );
          }
          console.log("[QoL-AIO] Avatar & Banner downloader active.");
        } catch (e) {
          console.warn("[QoL-AIO] Error patching Avatar/Banner downloader:", e);
        }

        // =========================================================================
        // 2. NO COMPRESSION (PHOTOS & VIDEOS UPLOAD AT ORIGINAL QUALITY & BITRATE)
        // =========================================================================
        try {
          const CloudUploadModule = findByProps("CloudUpload");
          const CloudUpload = CloudUploadModule && CloudUploadModule.CloudUpload;
          if (CloudUpload && CloudUpload.prototype && after) {
            unpatches.push(
              after("reactNativeCompressAndExtractData", CloudUpload.prototype, function (args, res) {
                if (!storage.noCompression) return res;
                const media = this;
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
        // 3. SILENT / INCOGNITO TYPING (WITH CONFIG TOGGLE)
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
        // 4. ANTI-ACCIDENTAL CALLS (CONFIRMATION DIALOG)
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
        // 5. OPEN IN EXTERNAL BROWSER DIRECTLY
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
        // 6. CLEAN URLS & MESSAGE SEND LATENCY ENHANCEMENT
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
        // 7. BACKGROUND AUDIO (VOICE NOTES & MP3 ATTACHMENTS)
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
        // 8. MESSAGE LOGGER (DELETED & EDITED MESSAGE RETENTION)
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

                  const rawMsg = message.toJS ? message.toJS() : message;
                  return [{
                    type: "MESSAGE_UPDATE",
                    message: {
                      ...rawMsg,
                      content: `*(deleted)* ${rawMsg.content || ""}`,
                      __qol_deleted: true,
                    },
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
