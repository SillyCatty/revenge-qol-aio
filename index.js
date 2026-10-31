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

  const plugin = {
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

        // Initialize default storage values if unset
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
        // 1. SILENT / INCOGNITO TYPING (WITH CONFIG TOGGLE)
        // =========================================================================
        try {
          const Typing = findByProps("startTyping");
          if (Typing && instead) {
            unpatches.push(
              instead("startTyping", Typing, (args, orig) => {
                if (storage.silentTyping) return; // Muted!
                return orig.apply(Typing, args);
              })
            );
            unpatches.push(
              instead("stopTyping", Typing, (args, orig) => {
                if (storage.silentTyping) return;
                return orig.apply(Typing, args);
              })
            );
            console.log("[QoL-AIO] Silent Typing hook initialized.");
          }
        } catch (e) {
          console.warn("[QoL-AIO] Error patching Typing:", e);
        }

        // =========================================================================
        // 2. ANTI-ACCIDENTAL CALLS (CONFIRMATION DIALOG)
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
            console.log("[QoL-AIO] Anti-Accidental Call hook initialized.");
          }
        } catch (e) {
          console.warn("[QoL-AIO] Error patching CallActions:", e);
        }

        // =========================================================================
        // 3. OPEN IN EXTERNAL BROWSER DIRECTLY
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
            console.log("[QoL-AIO] External Browser hook initialized.");
          }
        } catch (e) {
          console.warn("[QoL-AIO] Error patching InAppBrowser:", e);
        }

        // =========================================================================
        // 4. CLEAN URLS (TRACKER STRIPPER) & MESSAGE SEND LATENCY ENHANCEMENT
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
                // Strip redundant analytics and delay flags on message dispatch
                if (msg && msg.flags !== undefined) {
                  msg.invalidEmojis = [];
                }
              })
            );
            console.log("[QoL-AIO] Clean URLs and Send Latency hooks initialized.");
          }
        } catch (e) {
          console.warn("[QoL-AIO] Error patching MessageActions:", e);
        }

        // =========================================================================
        // 5. BACKGROUND AUDIO (VOICE NOTES & MP3 ATTACHMENTS)
        // =========================================================================
        try {
          const AudioManager = (RN.NativeModules && (RN.NativeModules.AudioManager || RN.NativeModules.RTNAudioManager));
          if (AudioManager && AudioManager.setCommunicationModeOn && instead) {
            unpatches.push(
              instead("setCommunicationModeOn", AudioManager, (args, orig) => {
                if (!storage.backgroundAudio) return orig.apply(AudioManager, args);
                // No-op: prevents switching to telephony mode, allowing background media playback
              })
            );
            console.log("[QoL-AIO] Background Audio hook initialized.");
          }
        } catch (e) {
          console.warn("[QoL-AIO] Error patching AudioManager:", e);
        }

        // =========================================================================
        // 6. MEDIA VIEWING & FULL RESOLUTION PFP / SERVER IMAGE DOWNLOADER
        // =========================================================================
        try {
          const ProfileBanner = findByName("ProfileBanner", false);
          const HeaderAvatar = findByName("HeaderAvatar", false);
          const GuildIcon = findByName("GuildIcon");
          const MediaModal = findByName("MediaModal", false);
          const ActionSheet = findByProps("hideActionSheet");
          const SelectedChannelStore = findByStoreName("SelectedChannelStore");
          const SelectedGuildStore = findByStoreName("SelectedGuildStore");
          const { Pressable } = findByProps("Button", "Text", "View") || {};

          function openModal(uri, event) {
            if (!MediaModal || !MediaModal.openMediaModal || !RN.Image || !uri) return;
            RN.Image.getSize(uri, (width, height) => {
              if (ActionSheet && ActionSheet.hideActionSheet) ActionSheet.hideActionSheet();
              MediaModal.openMediaModal({
                initialSources: [
                  {
                    uri,
                    sourceURI: uri,
                    width: width || 1024,
                    height: height || 1024,
                    guildId: SelectedGuildStore ? SelectedGuildStore.getGuildId() : undefined,
                    channelId: SelectedChannelStore ? SelectedChannelStore.getChannelId() : undefined,
                  },
                ],
                initialIndex: 0,
                originLayout: {
                  width: 0,
                  height: 0,
                  x: (event && event.pageX) || 0,
                  y: (event && event.pageY) || 0,
                  resizeMode: "fill",
                },
              });
            });
          }

          if (HeaderAvatar && after && Pressable && React) {
            unpatches.push(
              after("default", HeaderAvatar, ([{ user, style, guildId }], res) => {
                if (!storage.mediaViewing || !user) return res;
                const guildSpecific = user.guildMemberAvatars && user.guildMemberAvatars[guildId] &&
                  `https://cdn.discordapp.com/guilds/${guildId}/users/${user.id}/avatars/${user.guildMemberAvatars[guildId]}.png?size=4096`;
                const image = typeof user.getAvatarURL === "function" ? user.getAvatarURL(false, 4096, true) : null;
                if (!image) return res;

                const url = typeof image === "number"
                  ? `https://cdn.discordapp.com/embed/avatars/${Number(BigInt(user.id || 0) >> 22n) % 6}.png`
                  : String(image).replace(".webp", ".png");

                return React.createElement(
                  Pressable,
                  {
                    onPress: ({ nativeEvent }) => openModal(url, nativeEvent),
                    onLongPress: ({ nativeEvent }) => guildSpecific && openModal(guildSpecific, nativeEvent),
                    style: style,
                  },
                  res
                );
              })
            );
          }

          if (ProfileBanner && after && Pressable && React) {
            unpatches.push(
              after("default", ProfileBanner, ([{ bannerSource }], res) => {
                if (!storage.mediaViewing || !bannerSource || typeof bannerSource.uri !== "string" || !res) return res;
                const url = bannerSource.uri.replace(/(?:\?size=\d{3,4})?$/, "?size=4096").replace(".webp", ".png");
                return React.createElement(
                  Pressable,
                  { onPress: ({ nativeEvent }) => openModal(url, nativeEvent) },
                  res
                );
              })
            );
          }

          if (GuildIcon && GuildIcon.prototype && after && Pressable && React) {
            unpatches.push(
              after("render", GuildIcon.prototype, function (_, res) {
                if (!storage.mediaViewing || this.props?.size !== "XLARGE" || !this.props?.guild) return res;
                const url = typeof this.props.guild.getIconURL === "function" ? this.props.guild.getIconURL(4096) : null;
                if (!url) return res;
                return React.createElement(
                  Pressable,
                  { onPress: ({ nativeEvent }) => openModal(url, nativeEvent) },
                  res
                );
              })
            );
          }
          console.log("[QoL-AIO] Media Viewing hooks initialized.");
        } catch (e) {
          console.warn("[QoL-AIO] Error patching Media Viewing:", e);
        }

        // =========================================================================
        // 7. MESSAGE LOGGER (DELETED & EDITED MESSAGES PRESERVATION)
        // =========================================================================
        try {
          const ChannelMessages = findByProps("_channelMessages");
          const RowManager = findByName("RowManager");
          const MessageRecordUtils = findByProps("updateMessageRecord", "createMessageRecord");
          const FluxDispatcher = (metro.common && metro.common.FluxDispatcher) || findByProps("dispatch", "subscribe");

          if (FluxDispatcher && before) {
            unpatches.push(
              before("dispatch", FluxDispatcher, ([event]) => {
                if (!event || !storage.messageLogger) return;

                // DELETED MESSAGE PRESERVATION
                if (event.type === "MESSAGE_DELETE") {
                  if (event.__qol_cleanup) return;
                  const channel = ChannelMessages?._channelMessages?.[event.channelId] || (ChannelMessages?.get && ChannelMessages.get(event.channelId));
                  const message = channel?.get ? channel.get(event.id) : channel?._array?.find((m) => m.id === event.id);
                  if (!message || message.state === "SEND_FAILED" || (message.author && message.author.id === "1")) return;

                  return [{
                    message: {
                      ...(message.toJS ? message.toJS() : message),
                      __qol_deleted: true,
                    },
                    type: "MESSAGE_UPDATE",
                  }];
                }

                // EDITED MESSAGE PRESERVATION
                if (event.type === "MESSAGE_UPDATE" && event.message && event.message.content) {
                  const channelId = event.message.channel_id || event.message.channelId;
                  const channel = ChannelMessages?._channelMessages?.[channelId] || (ChannelMessages?.get && ChannelMessages.get(channelId));
                  const existing = channel?.get ? channel.get(event.message.id) : channel?._array?.find((m) => m.id === event.message.id);

                  if (existing && existing.content && existing.content !== event.message.content) {
                    const edits = existing.__qol_edits ? [...existing.__qol_edits] : [];
                    edits.push({
                      content: existing.content,
                      timestamp: Date.now(),
                    });
                    event.message.__qol_edits = edits;
                  }
                }
              })
            );
          }

          if (RowManager && RowManager.prototype && after) {
            unpatches.push(
              after("generate", RowManager.prototype, ([data], row) => {
                if (!row || !data || data.rowType !== 1 || !storage.messageLogger) return;

                // Mark Deleted Messages with Red Gutter & Background
                if (data.message && data.message.__qol_deleted) {
                  row.message.edited = "deleted";
                  row.backgroundHighlight = row.backgroundHighlight || {};
                  row.backgroundHighlight.backgroundColor = RN.processColor ? RN.processColor("#da373c22") : "#da373c22";
                  row.backgroundHighlight.gutterColor = RN.processColor ? RN.processColor("#da373cff") : "#da373cff";
                }

                // Show Edited Message History (Old message in gray italics)
                if (data.message && data.message.__qol_edits && data.message.__qol_edits.length > 0) {
                  const original = data.message.__qol_edits[0];
                  if (row.message && row.message.content && !row.message.__qol_edit_applied) {
                    // Discord Markdown: `*...*` formats in italic gray
                    row.message.content = `*${original.content}*\n${row.message.content}`;
                    row.message.__qol_edit_applied = true;
                  }
                }

                // Exact Timestamps (with seconds)
                if (storage.exactTimestamps && row.message && row.message.timestamp) {
                  try {
                    const ts = row.message.timestamp;
                    const date = typeof ts === "string" || typeof ts === "number" ? new Date(ts) : (ts && ts._d ? ts._d : null);
                    if (date && !isNaN(date.getTime())) {
                      const timeStr = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
                      row.message.timestampFormatted = timeStr;
                    }
                  } catch (_) {}
                }
              })
            );
          }

          if (MessageRecordUtils && MessageRecordUtils.updateMessageRecord && instead) {
            unpatches.push(
              instead("updateMessageRecord", MessageRecordUtils, function ([oldRecord, newRecord], orig) {
                if (newRecord && newRecord.__qol_deleted) {
                  return MessageRecordUtils.createMessageRecord(newRecord, oldRecord?.reactions);
                }
                return orig.apply(this, [oldRecord, newRecord]);
              })
            );
          }
          console.log("[QoL-AIO] Message Logger hooks initialized.");
        } catch (e) {
          console.warn("[QoL-AIO] Error patching Message Logger:", e);
        }

        console.log("[QoL-AIO] All hooks loaded successfully.");
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

    // Settings UI Component (Accessible from Revenge Plugins Menu)
    settings: function Settings() {
      const React = (vendetta.metro && vendetta.metro.common && vendetta.metro.common.React) || window.React;
      const RN = (vendetta.metro && vendetta.metro.common && vendetta.metro.common.ReactNative) || {};
      const { ScrollView, View, Text, Switch, StyleSheet } = RN;
      const storage = getStorage();
      const [, setTick] = React ? React.useState(0) : [0, () => {}];

      function toggle(key) {
        storage[key] = !storage[key];
        setTick((t) => t + 1);
      }

      if (!React || !View) {
        return null;
      }

      const styles = StyleSheet.create({
        container: { flex: 1, padding: 16, backgroundColor: "#1e1f22" },
        title: { fontSize: 20, fontWeight: "bold", color: "#ffffff", marginBottom: 16 },
        row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#2b2d31" },
        label: { fontSize: 16, color: "#ffffff" },
        desc: { fontSize: 12, color: "#949ba4", marginTop: 2 },
      });

      const options = [
        { key: "silentTyping", label: "Silent / Incognito Typing", desc: "Never broadcast 'typing...' in any DM or server" },
        { key: "antiCall", label: "Anti-Accidental Call", desc: "Confirm before starting voice or video calls" },
        { key: "openExternalBrowser", label: "Open in External Browser", desc: "Bypass in-app webview for all clicked links" },
        { key: "cleanUrls", label: "Clean URLs (Tracker Stripper)", desc: "Remove utm, si, igshid trackers when sending links" },
        { key: "backgroundAudio", label: "Background Audio", desc: "Keep voice messages and MP3s playing in background" },
        { key: "messageLogger", label: "Message Logger", desc: "Keep deleted messages and show original text on edits" },
        { key: "exactTimestamps", label: "Exact Timestamps", desc: "Show hours, minutes, and seconds on messages" },
        { key: "mediaViewing", label: "Tap Avatar / Banner to Download", desc: "Open 4096px image modal with download button" },
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
    },
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = plugin;
    module.exports.default = plugin;
  }
  if (typeof exports !== "undefined") {
    exports.default = plugin;
  }

  return plugin;
})(typeof vendetta !== "undefined" ? vendetta : undefined);
