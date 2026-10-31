(function (v) {
  "use strict";

  const vendetta = v || window.vendetta || window.revenge || window.bunny;
  let unpatches = [];
      if (moreAltsInstance && typeof moreAltsInstance.onUnload === "function") {
        try {
          moreAltsInstance.onUnload();
        } catch (_) {}
        moreAltsInstance = null;
      }


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
    moreAlts: true,
  };

  let moreAltsInstance = null;

  function loadMoreAlts(v) {
    const vendetta = v || window.vendetta || window.revenge || window.bunny;
    if (!vendetta) return null;
    try {
      const moreAltsModule = (function(D,ie,se,T,V,de,P,f,a,e,X,O,le,ue,ge){"use strict";function fe(t){const{metro:{findByProps:c,findByStoreName:l,common:{lodash:{merge:d}}}}=t,i=c("_sendMessage"),{createBotMessage:n}=c("createBotMessage"),o=c("BOT_AVATARS"),{getChannelId:s}=l("SelectedChannelStore");return function(r,y){if(r.channelId??=s(),[null,void 0].includes(r.channelId))throw new Error("No channel id to receive the message into (channelId)");let u=r;if(r.really){typeof y=="object"&&(u=d(u,y));const p=[u,{}];p[0].tts??=!1;for(const w of["allowedMentions","messageReference"])w in p[0]&&(p[1][w]=p[0][w],delete p[0][w]);const h="overwriteSendMessageArg2";return h in p[0]&&(p[1]=p[0][h],delete p[0][h]),i._sendMessage(r.channelId,...p)}return y!==!0&&(u=n(u)),typeof y=="object"&&(u=d(u,y),typeof y.author=="object"&&function(){const p=y.author;typeof p.avatarURL=="string"&&(o.BOT_AVATARS[p.avatar??p.avatarURL]=p.avatarURL,p.avatar??=p.avatarURL,delete p.avatarURL)}()),i.receiveMessage(u.channel_id,u),u}}function he(t,c=27){if(typeof t!="string")throw new Error("Passed chars isn't a string");if(t?.length<=0)throw new Error("Invalid chars length");let l="";for(let d=0;d<c;d++)l+=t[Math.floor(Math.random()*t.length)];return l}const ye={command:"https://cdn.discordapp.com/attachments/1099116247364407337/1112129955053187203/command.png"},q="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",K=q.replace("+/","_-");function pe(t,c){if(typeof t!="number")throw new Error(`Passed data isn't a number (received: ${typeof t})`);let l="";for(;t>0;)l=(c?K:q).charAt(t%64)+l,t=Math.floor(t/64);return l}const F=[],we=1e3;function g(t,c,l=null){const d={timestamp:new Date().toISOString(),type:t,message:c,data:l};F.unshift(d),F.length>we&&F.pop(),a.storage?.settings?.enableUnsafeFeatures&&console.log(`[AccountSwitcher] ${t.toUpperCase()}: ${c}`,l||"")}function J(){return F}function be(){F.length=0,g("info","Logs cleared")}function Z(t){let c=0;if(t.length===0)return c.toString();for(let l=0;l<t.length;l++){const d=t.charCodeAt(l);c=(c<<5)-c+d,c=c&c}return Math.abs(c).toString(36)}function Re({dialogInfo:t,onCancel:c,onSuccess:l,storage:d}){const[i,n]=e.React.useState(""),o=function(){if(!i.trim()){f.showToast("Please enter the password",1);return}Z(i)===d.settings.exportPasswordHash?(g("info","Password verification successful",{type:t.type}),l()):(g("warn","Incorrect password attempt",{type:t.type}),f.showToast("Incorrect password",1))};return e.React.createElement(e.ReactNative.View,{style:{flex:1,backgroundColor:"#2f3136"}},[e.React.createElement(e.ReactNative.View,{key:"pwd-header",style:{flexDirection:"row",alignItems:"center",padding:16,backgroundColor:"#202225",borderBottomWidth:1,borderBottomColor:"#40444b"}},[e.React.createElement(e.ReactNative.TouchableOpacity,{key:"back",onPress:c,style:{marginRight:16}},e.React.createElement(e.ReactNative.Text,{style:{color:"#7289da",fontSize:16}},"\u2190 Cancel")),e.React.createElement(e.ReactNative.Text,{key:"title",style:{color:"white",fontSize:18,fontWeight:"bold"}},t.title)]),e.React.createElement(e.ReactNative.View,{key:"pwd-content",style:{flex:1,padding:16,justifyContent:"center"}},[e.React.createElement(e.ReactNative.Text,{key:"message",style:{color:"#b9bbbe",fontSize:16,marginBottom:20,textAlign:"center"}},t.message),e.React.createElement(e.ReactNative.TextInput,{key:"password-input",placeholder:"Enter password",placeholderTextColor:"#72767d",value:i,onChangeText:n,secureTextEntry:!0,style:{backgroundColor:"#40444b",color:"white",padding:16,borderRadius:8,marginBottom:20,fontSize:16}}),e.React.createElement(e.ReactNative.TouchableOpacity,{key:"confirm-btn",onPress:o,style:{backgroundColor:"#7289da",paddingVertical:16,paddingHorizontal:20,borderRadius:8,alignItems:"center"}},e.React.createElement(e.ReactNative.Text,{style:{color:"white",fontSize:18,fontWeight:"bold"}},"Confirm"))])])}T.findByStoreName("UserStore");const ve=T.findByProps("getToken"),Te=async function(t,c){(function(l){t.settings?.exportPasswordHash?c({type:"export",title:"Enter Export Password",message:"Enter your password to export accounts",callback:l}):l()})(function(){O.showConfirmationAlert({title:"\u26A0\uFE0F Export Accounts - Security Warning",content:"Exporting accounts is UNSAFE and may lead to account takeover if shared with others. The export contains sensitive authentication tokens that give full access to your accounts. Only proceed if you understand the risks and will keep the data secure.",confirmText:"I Understand - Export",cancelText:"Cancel",confirmColor:"brand",onConfirm:async function(){try{g("info","Starting account export");const l=t.accounts||{},d=Object.values(l).map(function(n){return{username:n.username,discriminator:n.discriminator,avatar:n.avatar,id:n.id,token:n.token,addedAt:n.addedAt||Date.now()}}),i={accounts:d,exportPasswordHash:t.settings?.exportPasswordHash||null,exportedAt:Date.now(),version:"2.0"};e.clipboard.setString(JSON.stringify(i,null,2)),g("info","Accounts exported successfully",{count:d.length}),f.showToast(`Exported ${d.length} accounts to clipboard`,0)}catch(l){g("error","Failed to export accounts",{error:l.message}),console.error("Export error:",l),f.showToast("Failed to export accounts",1)}}})})},ke=async function(t,c,l){(function(d){t.settings?.exportPasswordHash?c({type:"import",title:"Enter Import Password",message:"Enter your password to import accounts",callback:d}):d()})(function(){O.showConfirmationAlert({title:"\u26A0\uFE0F Import Accounts - Security Warning",content:"Importing accounts is UNSAFE and may compromise your security if the data comes from untrusted sources. Only import data you exported yourself or from sources you completely trust. Malicious imports could lead to account takeover.",confirmText:"I Understand - Import",cancelText:"Cancel",confirmColor:"brand",onConfirm:async function(){try{g("info","Starting account import");let d=l.trim();if(!d)try{d=await e.clipboard.getString()}catch(r){g("error","Failed to get clipboard data",{error:r.message}),f.showToast("No data in clipboard or input field",1);return}if(!d){g("warn","No data to import"),f.showToast("No data to import",1);return}const i=JSON.parse(d);let n;if(i.accounts&&Array.isArray(i.accounts)){if(i.exportPasswordHash&&(!t.settings?.exportPasswordHash||t.settings.exportPasswordHash!==i.exportPasswordHash)){g("error","Import password mismatch"),f.showToast("Import password mismatch or not set locally",1);return}n=i.accounts,i.exportPasswordHash&&!t.settings?.exportPasswordHash&&(t.settings.exportPasswordHash=i.exportPasswordHash,g("info","Import password hash set from import data"))}else if(Array.isArray(i))n=i,g("debug","Using legacy import format");else{g("error","Invalid import format"),f.showToast("Invalid import format",1);return}let o=0,s=0;n.forEach(function(r){r.id&&r.token&&r.username&&(t.accounts[r.id]?s++:(t.accounts[r.id]={id:r.id,username:r.username,discriminator:r.discriminator||"0",avatar:r.avatar||null,displayName:r.displayName||r.username,token:r.token,addedAt:r.addedAt||Date.now()},t.accountOrder.includes(r.id)||t.accountOrder.push(r.id),o++))}),g("info","Import completed",{imported:o,skipped:s}),f.showToast(`Imported ${o} accounts, skipped ${s} duplicates`,0)}catch(d){g("error","Import failed",{error:d.message}),console.error("Import error:",d),f.showToast("Failed to import - invalid format or password mismatch",1)}}})})},me=function(t,c,l,d,i){if(!c.trim()){f.showToast("Please enter a password",1);return}if(c!==l){f.showToast("Passwords don't match",1);return}const n=Z(c);t.settings.exportPasswordHash=n,d(""),i(""),g("info","Export password set successfully"),f.showToast("Export password set successfully",0)},Se=function(t,c){(function(l){c({type:"remove",title:"Enter Password to Remove",message:"Enter your current password to remove protection",callback:l})})(function(){O.showConfirmationAlert({title:"Remove Export Password",content:"Are you sure you want to remove the export password? This will make exports/imports less secure.",confirmText:"Remove Password",cancelText:"Cancel",confirmColor:"brand",onConfirm:function(){delete t.settings.exportPasswordHash,g("info","Export password removed"),f.showToast("Export password removed",0)}})})},Ee=async function(t,c,l,d){if(t.settings.enableUnsafeFeatures){d(!0),g("info","Starting token account addition");try{let i=c.trim();if(i||(i=ve.getToken(),g("debug","Using current account token")),!i.startsWith("Bot ")&&!i.match(/^[A-Za-z0-9_-]{24,}\.[A-Za-z0-9_-]{6}\.[A-Za-z0-9_-]{27,}$/)){g("error","Invalid token format provided"),f.showToast("Invalid token format",1),d(!1);return}g("debug","Fetching user info from Discord API");const n=await fetch("https://discord.com/api/v9/users/@me",{headers:{Authorization:i,"Content-Type":"application/json"}});if(!n.ok){g("error","Discord API request failed",{status:n.status,statusText:n.statusText}),f.showToast("Invalid or expired token",1),d(!1);return}const o=await n.json();g("info","Successfully retrieved user info",{username:o.username,id:o.id});const s={id:o.id,username:o.username,discriminator:o.discriminator,avatar:o.avatar,displayName:o.global_name||o.username};if(t.accounts[s.id]){g("warn","Account already exists",{username:s.username}),f.showToast(`Account ${s.username} already saved`,1),d(!1);return}const r={...s,token:i,addedAt:Date.now()};t.accounts[s.id]=r,t.accountOrder.includes(s.id)||t.accountOrder.push(s.id),l(""),g("info","Account added successfully via token",{username:s.username}),f.showToast(`Account ${s.username} added!`,0)}catch(i){g("error","Failed to add account via token",{error:i.message,stack:i.stack}),console.error("Add account error:",i),f.showToast("Failed to add account",1)}d(!1)}},xe=async function(){O.showConfirmationAlert({title:"Force Logout",content:"This will logout your current session by using an invalid token. Your saved accounts will remain intact. Continue?",confirmText:"Force Logout",cancelText:"Cancel",confirmColor:"brand",onConfirm:async function(){try{g("info","Starting force logout");const t=["MTExMTExMTExMTExMTExMTEx","GxxxXx","xXxXxXxXxXxXxXxXxXxXxXxXxXxXx"].join(".");await T.findByProps("login","logout","switchAccountToken").switchAccountToken(t),g("info","Force logout completed successfully"),f.showToast("Force logout successful - you can now login to a different account",0)}catch(t){g("warn","Force logout completed with error",{error:t.message}),console.error("Force logout error:",t),f.showToast("Force logout completed",0)}}})},Ce=async function(t,c,l,d,i,n,o){if(!c.trim()||!l.trim()){f.showToast("Please enter both email and password",1);return}o(!0),g("info","Starting credential-based account addition",{email:c.trim()});try{const s=await fetch("https://discord.com/api/v9/auth/login",{method:"POST",headers:{"Content-Type":"application/json","User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"},body:JSON.stringify({login:c.trim(),password:l.trim()})}),r=await s.json();if(!s.ok||!r.token){g("error","Discord login failed",{status:s.status,message:r.message,errors:r.errors,captchaRequired:!!r.captcha_key});let h="Login failed";if(r.captcha_key)h="Captcha required - please login through Discord first";else if(r.message){const w=r.message.toLowerCase();w.includes("invalid")&&(w.includes("email")||w.includes("phone")||w.includes("login"))?h="Invalid email or username":w.includes("password")?h="Invalid password":w.includes("account")?h="Account issue - check your credentials":w.includes("rate limit")||w.includes("too many")?h="Too many attempts - please wait and try again":w.includes("mfa")||w.includes("2fa")||w.includes("verification")?h="2FA/MFA accounts not supported via credentials":h="Login failed - check your credentials"}else if(r.errors){const w=r.errors;w.login?h="Invalid email or username":w.password?h="Invalid password":h="Invalid credentials"}else s.status===401?h="Invalid credentials":s.status===429?h="Rate limited - please wait and try again":s.status>=500&&(h="Discord servers are having issues - try again later");f.showToast(h,1),o(!1);return}g("debug","Login successful, fetching user info");const y=await fetch("https://discord.com/api/v9/users/@me",{headers:{Authorization:r.token}});if(!y.ok){g("error","Failed to get user info after login",{status:y.status}),f.showToast("Login succeeded but failed to get user info - check logs",1),o(!1);return}const u=await y.json();if(t.accounts[u.id]){g("warn","Account already exists",{username:u.username}),f.showToast(`Account ${u.username} already saved`,1),o(!1);return}const p={id:u.id,username:u.username,discriminator:u.discriminator,avatar:u.avatar,displayName:u.global_name||u.username,token:r.token,addedAt:Date.now()};t.accounts[u.id]=p,t.accountOrder.includes(u.id)||t.accountOrder.push(u.id),d(""),i(""),n(!1),g("info","Account added successfully via credentials",{username:u.username}),f.showToast(`Account ${u.username} added successfully!`,0)}catch(s){g("error","Credential login failed",{error:s.message,stack:s.stack}),console.error("Login error:",s);let r="Login failed - check logs for more info";s.message.includes("network")||s.message.includes("fetch")?r="Network error - check your connection":s.message.includes("timeout")&&(r="Request timed out - try again"),f.showToast(r,1)}o(!1)},Y=T.findByStoreName("UserStore"),Q=T.findByProps("getToken");a.storage.accounts||(a.storage.accounts={}),a.storage.accountOrder||(a.storage.accountOrder=[]),a.storage.settings?(a.storage.settings.enableUnsafeFeatures===void 0&&(a.storage.settings.enableUnsafeFeatures=!1),a.storage.settings.enableCLI===void 0&&(a.storage.settings.enableCLI=a.storage.settings.showAccountNames!==!1),a.storage.settings.confirmBeforeDelete===void 0&&(a.storage.settings.confirmBeforeDelete=!0),a.storage.settings.addToSidebar===void 0&&(a.storage.settings.addToSidebar=!0),a.storage.settings.showAccountNames!==void 0&&delete a.storage.settings.showAccountNames):a.storage.settings={enableCLI:!0,confirmBeforeDelete:!0,enableUnsafeFeatures:!1,addToSidebar:!0},g("info","AccountSwitcher plugin initialized",{accountsCount:Object.keys(a.storage.accounts).length,cliEnabled:a.storage.settings.enableCLI,unsafeFeaturesEnabled:a.storage.settings.enableUnsafeFeatures});function Ae({onBack:t}){X.useProxy(a.storage);const[c,l]=e.React.useState(""),[d,i]=e.React.useState(!1),[n,o]=e.React.useState(""),[s,r]=e.React.useState(null),[y,u]=e.React.useState(""),[p,h]=e.React.useState(""),w=function(v,B){const x={...a.storage.settings,[v]:B};a.storage.settings=x,g("info",`Setting updated: ${v}`,{newValue:B})},C=function(){const v=J(),B=v.map(function(x){return`[${x.timestamp}] ${x.type.toUpperCase()}: ${x.message}${x.data?" | Data: "+JSON.stringify(x.data):""}`}).join(`
`);e.clipboard.setString(B),g("info","Logs copied to clipboard",{count:v.length}),f.showToast(`Copied ${v.length} log entries to clipboard`,0)},j=function(v){v?O.showConfirmationAlert({title:"\u26A0\uFE0F Enable Unsafe Features - Security Warning",content:"Unsafe features include token copying, manual token adding, and detailed logging. These features can compromise your account security if misused. Tokens provide full access to accounts and should never be shared. Only enable if you understand the security implications.",confirmText:"I Understand - Enable",cancelText:"Cancel",confirmColor:"brand",onConfirm:function(){return w("enableUnsafeFeatures",!0)}}):w("enableUnsafeFeatures",!1)},_=function(){r(null)},G=function(){const v=s.callback;r(null),v()};return s?e.React.createElement(Re,{dialogInfo:s,onCancel:_,onSuccess:G,storage:a.storage}):e.React.createElement(e.ReactNative.View,{style:{flex:1,backgroundColor:"#2f3136"}},[e.React.createElement(e.ReactNative.View,{key:"header",style:{flexDirection:"row",alignItems:"center",padding:16,backgroundColor:"#202225",borderBottomWidth:1,borderBottomColor:"#40444b"}},[e.React.createElement(e.ReactNative.TouchableOpacity,{key:"back",onPress:t,style:{marginRight:16}},e.React.createElement(e.ReactNative.Text,{style:{color:"#7289da",fontSize:16}},"\u2190 Back to Accounts")),e.React.createElement(e.ReactNative.Text,{key:"title",style:{color:"white",fontSize:18,fontWeight:"bold"}},"Settings")]),e.React.createElement(e.ReactNative.ScrollView,{key:"content",style:{flex:1,padding:16},contentContainerStyle:{paddingBottom:100}},[e.React.createElement(e.ReactNative.View,{key:"export-import",style:{marginBottom:24}},[e.React.createElement(e.ReactNative.Text,{key:"export-title",style:{color:"#b9bbbe",fontSize:14,fontWeight:"bold",marginBottom:12}},"BACKUP & RESTORE"),e.React.createElement(e.ReactNative.TouchableOpacity,{key:"export-btn",onPress:function(){return Te(a.storage,r)},style:{backgroundColor:"#7289da",paddingVertical:12,paddingHorizontal:16,borderRadius:8,marginBottom:12,alignItems:"center"}},e.React.createElement(e.ReactNative.Text,{style:{color:"white",fontSize:16,fontWeight:"bold"}},"\u{1F4E4} Export Accounts to Clipboard")),e.React.createElement(e.ReactNative.TextInput,{key:"import-input",placeholder:"Paste exported account data here (or leave empty to use clipboard)...",placeholderTextColor:"#72767d",value:n,onChangeText:o,multiline:!0,numberOfLines:4,style:{backgroundColor:"#40444b",color:"white",padding:12,borderRadius:8,marginBottom:12,fontSize:14,textAlignVertical:"top"}}),e.React.createElement(e.ReactNative.TouchableOpacity,{key:"import-btn",onPress:function(){return ke(a.storage,r,n)},style:{backgroundColor:"#43b581",paddingVertical:12,paddingHorizontal:16,borderRadius:8,marginBottom:12,alignItems:"center"}},e.React.createElement(e.ReactNative.Text,{style:{color:"white",fontSize:16,fontWeight:"bold"}},"\u{1F4E5} Import Accounts")),e.React.createElement(e.ReactNative.TouchableOpacity,{key:"force-logout-btn",onPress:xe,style:{backgroundColor:"#f04747",paddingVertical:12,paddingHorizontal:16,borderRadius:8,alignItems:"center"}},e.React.createElement(e.ReactNative.Text,{style:{color:"white",fontSize:16,fontWeight:"bold"}},"\u{1F6AA} Force Logout"))]),e.React.createElement(e.ReactNative.View,{key:"export-password",style:{marginBottom:24}},[e.React.createElement(e.ReactNative.Text,{key:"password-title",style:{color:"#b9bbbe",fontSize:14,fontWeight:"bold",marginBottom:12}},"EXPORT PASSWORD PROTECTION"),a.storage.settings.exportPasswordHash?e.React.createElement(e.ReactNative.View,{key:"password-set"},[e.React.createElement(e.ReactNative.Text,{key:"status",style:{color:"#43b581",fontSize:16,marginBottom:12}},"\u2713 Export password is set (hashed)"),e.React.createElement(e.ReactNative.TouchableOpacity,{key:"remove-pwd",onPress:function(){return Se(a.storage,r)},style:{backgroundColor:"#f04747",paddingVertical:12,paddingHorizontal:16,borderRadius:8,alignItems:"center"}},e.React.createElement(e.ReactNative.Text,{style:{color:"white",fontSize:16,fontWeight:"bold"}},"Remove Password"))]):e.React.createElement(e.ReactNative.View,{key:"password-unset"},[e.React.createElement(e.ReactNative.Text,{key:"desc",style:{color:"#72767d",fontSize:14,marginBottom:12}},"Set a password to protect your account exports and imports (will be hashed for security)"),e.React.createElement(e.ReactNative.TextInput,{key:"new-password",placeholder:"New password",placeholderTextColor:"#72767d",value:y,onChangeText:u,secureTextEntry:!0,style:{backgroundColor:"#40444b",color:"white",padding:12,borderRadius:8,marginBottom:8,fontSize:14}}),e.React.createElement(e.ReactNative.TextInput,{key:"confirm-password",placeholder:"Confirm password",placeholderTextColor:"#72767d",value:p,onChangeText:h,secureTextEntry:!0,style:{backgroundColor:"#40444b",color:"white",padding:12,borderRadius:8,marginBottom:12,fontSize:14}}),e.React.createElement(e.ReactNative.TouchableOpacity,{key:"set-password",onPress:function(){return me(a.storage,y,p,u,h)},style:{backgroundColor:"#7289da",paddingVertical:12,paddingHorizontal:16,borderRadius:8,alignItems:"center"}},e.React.createElement(e.ReactNative.Text,{style:{color:"white",fontSize:16,fontWeight:"bold"}},"Set Password"))])]),e.React.createElement(e.ReactNative.View,{key:"unsafe",style:{marginBottom:24}},[e.React.createElement(e.ReactNative.Text,{key:"unsafe-title",style:{color:"#f04747",fontSize:14,fontWeight:"bold",marginBottom:12}},"UNSAFE FEATURES"),e.React.createElement(e.ReactNative.View,{key:"enable-unsafe",style:{flexDirection:"row",justifyContent:"space-between",alignItems:"center",paddingVertical:12,backgroundColor:"#36393f",paddingHorizontal:16,borderRadius:8,marginBottom:8}},[e.React.createElement(e.ReactNative.View,{key:"text-container",style:{flex:1}},[e.React.createElement(e.ReactNative.Text,{key:"label",style:{color:"white",fontSize:16}},"Enable Unsafe Features"),e.React.createElement(e.ReactNative.Text,{key:"desc",style:{color:"#72767d",fontSize:12,marginTop:2}},"Allows token operations, detailed logging, and troubleshooting")]),e.React.createElement(e.ReactNative.Switch,{key:"toggle",value:a.storage.settings.enableUnsafeFeatures,onValueChange:j,trackColor:{false:"#72767d",true:"#f04747"},thumbColor:"white"})]),a.storage.settings.enableUnsafeFeatures&&e.React.createElement(e.ReactNative.View,{key:"unsafe-features",style:{marginTop:16}},[e.React.createElement(e.ReactNative.Text,{key:"logging-title",style:{color:"#b9bbbe",fontSize:14,fontWeight:"bold",marginBottom:8}},"TROUBLESHOOTING & LOGGING"),e.React.createElement(e.ReactNative.View,{key:"log-actions",style:{flexDirection:"row",gap:8,marginBottom:16}},[e.React.createElement(e.ReactNative.TouchableOpacity,{key:"copy-logs",onPress:C,style:{flex:1,backgroundColor:"#7289da",paddingVertical:10,paddingHorizontal:12,borderRadius:6,alignItems:"center"}},e.React.createElement(e.ReactNative.Text,{style:{color:"white",fontSize:14,fontWeight:"bold"}},`Copy Logs (${J().length})`)),e.React.createElement(e.ReactNative.TouchableOpacity,{key:"clear-logs",onPress:be,style:{flex:1,backgroundColor:"#f04747",paddingVertical:10,paddingHorizontal:12,borderRadius:6,alignItems:"center"}},e.React.createElement(e.ReactNative.Text,{style:{color:"white",fontSize:14,fontWeight:"bold"}},"Clear Logs"))]),e.React.createElement(e.ReactNative.Text,{key:"token-title",style:{color:"#b9bbbe",fontSize:14,fontWeight:"bold",marginBottom:8}},"ADD ACCOUNT VIA TOKEN"),e.React.createElement(e.ReactNative.TextInput,{key:"token-input",placeholder:"Paste account token here (leave empty to add current account)...",placeholderTextColor:"#72767d",value:c,onChangeText:l,secureTextEntry:!0,style:{backgroundColor:"#40444b",color:"white",padding:12,borderRadius:8,marginBottom:12,fontSize:14}}),e.React.createElement(e.ReactNative.TouchableOpacity,{key:"add-btn",onPress:function(){return Ee(a.storage,c,l,i)},disabled:d,style:{backgroundColor:d?"#5c6bc0":"#7289da",paddingVertical:12,paddingHorizontal:20,borderRadius:8,alignItems:"center",opacity:d?.6:1}},e.React.createElement(e.ReactNative.Text,{style:{color:"white",fontSize:16,fontWeight:"bold"}},d?"Adding...":c.trim()?"Add Account":"Add Current Account"))])]),e.React.createElement(e.ReactNative.View,{key:"general",style:{marginBottom:24}},[e.React.createElement(e.ReactNative.Text,{key:"general-title",style:{color:"#b9bbbe",fontSize:14,fontWeight:"bold",marginBottom:12}},"GENERAL"),e.React.createElement(e.ReactNative.View,{key:"enable-cli",style:{flexDirection:"row",justifyContent:"space-between",alignItems:"center",paddingVertical:12,backgroundColor:"#36393f",paddingHorizontal:16,borderRadius:8,marginBottom:8}},[e.React.createElement(e.ReactNative.Text,{key:"label",style:{color:"white",fontSize:16}},"Enable CLI Interface"),e.React.createElement(e.ReactNative.Switch,{key:"toggle",value:a.storage.settings.enableCLI,onValueChange:function(v){return w("enableCLI",v)},trackColor:{false:"#72767d",true:"#7289da"},thumbColor:"white"})]),e.React.createElement(e.ReactNative.View,{key:"add-to-sidebar",style:{flexDirection:"row",justifyContent:"space-between",alignItems:"center",paddingVertical:12,backgroundColor:"#36393f",paddingHorizontal:16,borderRadius:8,marginBottom:8}},[e.React.createElement(e.ReactNative.View,{key:"text-container",style:{flex:1}},[e.React.createElement(e.ReactNative.Text,{key:"label",style:{color:"white",fontSize:16}},"Add to Settings Sidebar"),e.React.createElement(e.ReactNative.Text,{key:"desc",style:{color:"#72767d",fontSize:12,marginTop:2}},"Show Account Switcher in Revenge settings menu")]),e.React.createElement(e.ReactNative.Switch,{key:"toggle",value:a.storage.settings.addToSidebar,onValueChange:function(v){w("addToSidebar",v),v?f.showToast("Sidebar enabled - restart app to see changes",0):f.showToast("Sidebar disabled - restart app to remove",0)},trackColor:{false:"#72767d",true:"#7289da"},thumbColor:"white"})]),e.React.createElement(e.ReactNative.View,{key:"confirm-delete",style:{flexDirection:"row",justifyContent:"space-between",alignItems:"center",paddingVertical:12,backgroundColor:"#36393f",paddingHorizontal:16,borderRadius:8}},[e.React.createElement(e.ReactNative.Text,{key:"label",style:{color:"white",fontSize:16}},"Confirm Before Delete"),e.React.createElement(e.ReactNative.Switch,{key:"toggle",value:a.storage.settings.confirmBeforeDelete,onValueChange:function(v){return w("confirmBeforeDelete",v)},trackColor:{false:"#72767d",true:"#7289da"},thumbColor:"white"})])])])])}function ee(t){X.useProxy(a.storage);const[c,l]=e.React.useState(!1),[d,i]=e.React.useState(null),[n,o]=e.React.useState(!1),[s,r]=e.React.useState(""),[y,u]=e.React.useState(""),[p,h]=e.React.useState(!1),w=Y.getCurrentUser()?.id,C=function(b){const R=a.storage.accounts[b];if(!R)return;const k=b===w,E=R.username;g("info","Attempting to remove account",{username:E,isCurrent:k});const $=function(){delete a.storage.accounts[b],a.storage.accountOrder=a.storage.accountOrder.filter(function(U){return U!==b})},oe=function(){$(),g("info","Account removed from switcher only",{username:E}),f.showToast(`Account ${E} removed from switcher`,0)},ce=async function(){try{g("info","Starting account removal and logout",{username:E});const U=Q.getToken();await T.findByProps("login","logout","switchAccountToken").switchAccountToken(R.token),g("debug","Switched to account for logout"),await T.findByProps("login","logout").logout(),g("debug","Account logged out from Discord"),setTimeout(async function(){try{await T.findByProps("login","logout","switchAccountToken").switchAccountToken(U),g("debug","Switched back to original account")}catch(We){g("warn","Could not switch back to original account",{error:We.message})}},100)}catch(U){g("error","Failed to logout account from Discord",{error:U.message}),f.showToast("Failed to logout, but removed from switcher",1)}$(),g("info","Account removed and logged out",{username:E}),f.showToast(`Account ${E} removed and logged out`,0)};a.storage.settings.confirmBeforeDelete?e.ReactNative.Alert.alert(k?"Remove Current Account":"Remove Account",k?"Do you want to remove the current account from the switcher? (To logout, use Force Logout in settings)":`What do you want to do with ${E}?`,[{text:"Cancel",style:"cancel"},{text:"Delete from switcher only",onPress:oe},!k&&{text:"Delete and logout",onPress:ce}].filter(Boolean)):k?oe():ce()},j=async function(b){const R=a.storage.accounts[b];if(R){i(b),g("info","Starting account switch",{username:R.username});try{f.showToast(`Switching to ${R.username}...`,0),await T.findByProps("login","logout","switchAccountToken").switchAccountToken(R.token),g("info","Account switch successful",{username:R.username}),f.showToast(`Switched to ${R.username}!`,0)}catch(k){g("error","Account switch failed",{username:R.username,error:k.message}),console.error("Switch error:",k),f.showToast(`Failed to switch: ${k.message}`,1)}i(null)}},_=function(b){if(!a.storage.settings.enableUnsafeFeatures)return;const R=a.storage.accounts[b];R&&(e.clipboard.setString(R.token),g("info","Token copied to clipboard",{username:R.username}),f.showToast(`Token for ${R.username} copied`,0))},G=async function(){h(!0),g("info","Adding current account");try{const b=Q.getToken(),R=Y.getCurrentUser();if(!R||a.storage.accounts[R.id]){const E=a.storage.accounts[R.id]?"Current account already saved":"Failed to get current user";g("warn",E,{userId:R?.id}),f.showToast(E,1),h(!1);return}const k={id:R.id,username:R.username,discriminator:R.discriminator,avatar:R.avatar,displayName:R.globalName||R.username,token:b,addedAt:Date.now()};a.storage.accounts[R.id]=k,a.storage.accountOrder.includes(R.id)||a.storage.accountOrder.push(R.id),o(!1),g("info","Current account added successfully",{username:R.username}),f.showToast(`Current account ${R.username} added!`,0)}catch(b){g("error","Failed to add current account",{error:b.message}),console.error("Add current account error:",b),f.showToast("Failed to add current account",1)}h(!1)},v=async function(){await Ce(a.storage,s,y,r,u,o,h)},B=function(b){return new Date(b).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})},x=a.storage.accountOrder.filter(function(b){return a.storage.accounts[b]}).map(function(b){return a.storage.accounts[b]});return c?e.React.createElement(Ae,{onBack:function(){return l(!1)}}):n?e.React.createElement(e.ReactNative.View,{style:{flex:1,backgroundColor:"#2f3136"}},[e.React.createElement(e.ReactNative.View,{key:"add-header",style:{flexDirection:"row",alignItems:"center",padding:16,backgroundColor:"#202225",borderBottomWidth:1,borderBottomColor:"#40444b"}},[e.React.createElement(e.ReactNative.TouchableOpacity,{key:"back",onPress:function(){o(!1),r(""),u("")},style:{marginRight:16}},e.React.createElement(e.ReactNative.Text,{style:{color:"#7289da",fontSize:16}},"\u2190 Back")),e.React.createElement(e.ReactNative.Text,{key:"title",style:{color:"white",fontSize:18,fontWeight:"bold"}},"Add Account")]),e.React.createElement(e.ReactNative.ScrollView,{key:"add-content",style:{flex:1},contentContainerStyle:{padding:16,paddingBottom:100}},[e.React.createElement(e.ReactNative.Text,{key:"instruction",style:{color:"#b9bbbe",fontSize:16,marginBottom:20,textAlign:"center"}},"Enter your Discord account credentials or add your current account"),e.React.createElement(e.ReactNative.TextInput,{key:"email-input",placeholder:"Email address",placeholderTextColor:"#72767d",value:s,onChangeText:r,keyboardType:"email-address",autoCapitalize:"none",style:{backgroundColor:"#40444b",color:"white",padding:16,borderRadius:8,marginBottom:12,fontSize:16}}),e.React.createElement(e.ReactNative.TextInput,{key:"password-input",placeholder:"Password",placeholderTextColor:"#72767d",value:y,onChangeText:u,secureTextEntry:!0,style:{backgroundColor:"#40444b",color:"white",padding:16,borderRadius:8,marginBottom:20,fontSize:16}}),e.React.createElement(e.ReactNative.TouchableOpacity,{key:"login-btn",onPress:v,disabled:p,style:{backgroundColor:p?"#5c6bc0":"#7289da",paddingVertical:16,paddingHorizontal:20,borderRadius:8,alignItems:"center",marginBottom:12,opacity:p?.6:1}},e.React.createElement(e.ReactNative.Text,{style:{color:"white",fontSize:18,fontWeight:"bold"}},p?"Adding Account...":"Add Account with Email & Password")),e.React.createElement(e.ReactNative.View,{key:"divider",style:{height:1,backgroundColor:"#40444b",marginVertical:16}}),e.React.createElement(e.ReactNative.TouchableOpacity,{key:"add-current-btn",onPress:G,disabled:p,style:{backgroundColor:p?"#5c6bc0":"#43b581",paddingVertical:16,paddingHorizontal:20,borderRadius:8,alignItems:"center",opacity:p?.6:1}},e.React.createElement(e.ReactNative.Text,{style:{color:"white",fontSize:18,fontWeight:"bold"}},p?"Adding...":"Add Current Account"))])]):e.React.createElement(e.ReactNative.View,{style:{flex:1,backgroundColor:"#2f3136"}},[e.React.createElement(e.ReactNative.View,{key:"header",style:{flexDirection:"row",alignItems:"center",justifyContent:"space-between",padding:16,backgroundColor:"#202225",borderBottomWidth:1,borderBottomColor:"#40444b"}},[e.React.createElement(e.ReactNative.Text,{key:"title",style:{color:"white",fontSize:20,fontWeight:"bold"}},"Account Switcher"),e.React.createElement(e.ReactNative.TouchableOpacity,{key:"settings-btn",onPress:function(){return l(!0)},style:{padding:8,borderRadius:6,backgroundColor:"#4f545c"}},e.React.createElement(e.ReactNative.Text,{style:{color:"white",fontSize:18}},"\u2699\uFE0F"))]),e.React.createElement(e.ReactNative.View,{key:"accounts-section",style:{flex:1,padding:16}},[e.React.createElement(e.ReactNative.Text,{key:"section-title",style:{color:"#b9bbbe",fontSize:14,fontWeight:"bold",marginBottom:12}},`SAVED ACCOUNTS (${x.length})`),x.length===0?e.React.createElement(e.ReactNative.View,{key:"empty",style:{alignItems:"center",justifyContent:"center",paddingVertical:40}},[e.React.createElement(e.ReactNative.Text,{key:"empty-text",style:{color:"#72767d",fontSize:16,marginBottom:8}},"No accounts saved yet"),e.React.createElement(e.ReactNative.Text,{key:"empty-hint",style:{color:"#72767d",fontSize:14,textAlign:"center"}},"Access the switcher by pressing the logout button on the main settings page.")]):e.React.createElement(e.ReactNative.ScrollView,{key:"accounts-scroll",style:{flex:1},contentContainerStyle:{paddingBottom:100}},x.map(function(b,R){const k=b.id===w,E=d===b.id;let $="https://cdn.discordapp.com/embed/avatars/1.png";return b.avatar&&($=`https://cdn.discordapp.com/avatars/${b.id}/${b.avatar}.png?size=48`),e.React.createElement(e.ReactNative.View,{key:b.id,style:{flexDirection:"row",alignItems:"center",backgroundColor:k?"#7289da20":"#36393f",borderWidth:k?2:0,borderColor:"#7289da",borderRadius:12,padding:12,marginBottom:12}},[e.React.createElement(e.ReactNative.TouchableOpacity,{key:"avatar",onPress:function(){return j(b.id)},disabled:k||E,style:{marginRight:12}},e.React.createElement(e.ReactNative.Image,{source:{uri:$},style:{width:48,height:48,borderRadius:24,opacity:k||E?.7:1}})),e.React.createElement(e.ReactNative.View,{key:"info",style:{flex:1}},[e.React.createElement(e.ReactNative.Text,{key:"name",style:{color:"white",fontSize:16,fontWeight:"bold"}},`${R+1}. ${a.storage.settings.enableCLI?`${b.username}${b.discriminator!=="0"?`#${b.discriminator}`:""}`:b.displayName}`),e.React.createElement(e.ReactNative.Text,{key:"status",style:{color:k?"#43b581":"#72767d",fontSize:12,marginTop:2}},k?"\u2713 Current Account":E?"Switching...":"Tap avatar to switch"),e.React.createElement(e.ReactNative.Text,{key:"date",style:{color:"#72767d",fontSize:11,marginTop:2}},`Added: ${B(b.addedAt||Date.now())}`)]),e.React.createElement(e.ReactNative.View,{key:"actions",style:{flexDirection:"column",alignItems:"flex-end"}},[a.storage.settings.enableUnsafeFeatures&&e.React.createElement(e.ReactNative.TouchableOpacity,{key:"copy",onPress:function(){return _(b.id)},style:{backgroundColor:"#4f545c",paddingHorizontal:12,paddingVertical:6,borderRadius:6,minWidth:80,alignItems:"center",marginBottom:6}},e.React.createElement(e.ReactNative.Text,{style:{color:"white",fontSize:12,fontWeight:"bold"}},"Copy Token")),e.React.createElement(e.ReactNative.TouchableOpacity,{key:"remove",onPress:function(){return C(b.id)},style:{backgroundColor:"#f04747",paddingHorizontal:12,paddingVertical:6,borderRadius:6,minWidth:80,alignItems:"center"}},e.React.createElement(e.ReactNative.Text,{style:{color:"white",fontSize:12,fontWeight:"bold"}},"Remove"))])])}))]),e.React.createElement(e.ReactNative.View,{key:"bottom-actions",style:{position:"absolute",bottom:0,left:0,right:0,backgroundColor:"#202225",borderTopWidth:1,borderTopColor:"#40444b",paddingVertical:12,paddingHorizontal:16,paddingBottom:40}},e.React.createElement(e.ReactNative.TouchableOpacity,{key:"add",onPress:function(){return o(!0)},style:{backgroundColor:"#7289da",paddingVertical:16,paddingHorizontal:20,borderRadius:8,alignItems:"center",flexDirection:"row",justifyContent:"center"}},[e.React.createElement(e.ReactNative.Text,{key:"add-icon",style:{color:"white",fontSize:20,marginRight:8}},"+"),e.React.createElement(e.ReactNative.Text,{key:"add-text",style:{color:"white",fontSize:18,fontWeight:"bold"}},"Add Account")]))])}const{FormSection:Ne,FormRow:W}=ue.Forms,{TableRowIcon:Ie}=T.findByProps("TableRowIcon"),z=window.bunny,te=z?.metro?.findByPropsLazy("getRootNavigationRef"),M=z?.metro?.findByPropsLazy("SETTING_RENDERER_CONFIG"),ae=z?.metro?.findByNameLazy("SettingsOverviewScreen",!1),re=z.metro.findByPropsLazy("createList");function Be({tabs:t}){const c=e.NavigationNative.useNavigation();return e.React.createElement(W,{label:t.title(),leading:e.React.createElement(W.Icon,{source:t.icon}),trailing:e.React.createElement(e.React.Fragment,{},[t.trailing?t.trailing():null,e.React.createElement(W.Arrow,{key:"arrow"})]),onPress:function(){const l=t.page;c.navigate("VendettaCustomPage",{title:t.title(),render:function(){return e.React.createElement(l)}})}})}function Pe(t,c){try{c.push(P.after("default",z?.metro?.findByNameLazy("UserSettingsOverviewWrapper",!1),function(l,d){const i=V.findInReactTree(d.props.children,function(n){return n.type?.name==="UserSettingsOverview"});i&&c.push(P.after("render",i.type.prototype,function(n,o){const s=V.findInReactTree(o.props.children,function(r){return r?.children?.[1]?.type===Ne})?.children;if(s){const r=s.findIndex(function(y){return["BILLING_SETTINGS","PREMIUM_SETTINGS"].includes(y?.props?.label)});s.splice(-~r||4,0,e.React.createElement(Be,{key:t.key,tabs:t}))}}))},!0))}catch(l){ge.logger.info("Panel UI patch failed graciously \u{1F494}",l)}}function Oe(t,c){if(!M||!ae||!te){console.warn("[AccountSwitcher] Missing required constants for tabs UI patch");return}const l={};l[t.key]={type:"pressable",title:t.title,useTitle:t.title,icon:t.icon,IconComponent:t.icon&&function(){const n=typeof t.icon=="object"&&t.icon.uri!==void 0?t.icon.uri:t.icon;return e.React.createElement(Ie,{source:n})},usePredicate:t.predicate,useTrailing:t.trailing,onPress:function(){const n=te.getRootNavigationRef(),o=t.page;n.navigate("VendettaCustomPage",{title:t.title(),render:function(){return e.React.createElement(o)}})},withArrow:!0};let d=M.SETTING_RENDERER_CONFIG;Object.defineProperty(M,"SETTING_RENDERER_CONFIG",{enumerable:!0,configurable:!0,get:function(){return{...d,...l}},set:function(n){return d=n}});const i=Symbol("AccountSwitcher-pinToSettings");try{if(!re)return;c.push(P.after("createList",re,function(n,o){if(!n[0][i]){n[0][i]=!0;const[s]=n,r=s.sections,y=r?.find(function(u){return["Bunny","Kettu","Revenge"].includes(u?.label)});y||Boolean(r?.find(function(u){return u.settings.includes("ACCOUNT")}))&&r.unshift({label:a.manifest.name,title:a.manifest.name,settings:[t.key]}),y?.settings&&(y.settings=[...y.settings,t.key])}}))}catch{c.push(P.after("default",ae,function(n,o){if(!n[0][i]){n[0][i]=!0;const{sections:s}=V.findInReactTree(o,function(y){return y.props?.sections}).props,r=s?.find(function(y){return["Bunny","Kettu","Revenge"].includes(y?.label)});r||Boolean(s?.find(function(y){return y.settings.includes("ACCOUNT")}))&&s.unshift({label:a.manifest.name,title:a.manifest.name,settings:[t.key]}),r?.settings&&(r.settings=[...r.settings,t.key])}}))}}function Fe(t){const c=[];let l=!1;const d=t.predicate||function(){return!0};return t.predicate=function(){return l?!1:d()},Pe(t,c),Oe(t,c),c.push(function(){return l=!0}),function(){for(const i of c)i()}}function ze(){if(!a.storage.settings?.addToSidebar)return console.log("[AccountSwitcher] Sidebar disabled in settings"),function(){};console.log("[AccountSwitcher] Patching sidebar using custom patchSettingsPin...");try{const t=Fe({key:"AccountSwitcher",icon:le.getAssetIDByName("UserIcon"),title:function(){return"Account Switcher"},predicate:function(){return a.storage.settings?.addToSidebar===!0},page:ee});return console.log("[AccountSwitcher] Successfully patched sidebar"),t}catch(t){return console.error("[AccountSwitcher] Failed to patch sidebar:",t),function(){}}}const{meta:{resolveSemanticColor:$e}}=T.findByProps("colors","meta"),Ue=T.findByStoreName("ThemeStore"),A=T.findByStoreName("UserStore"),m=function(){return parseInt($e(Ue.theme,ie.semanticColors.BACKGROUND_SECONDARY).slice(1),16)},I={author:{username:"AccountSwitcher",avatar:"command",avatarURL:ye?.command}};a.storage.accounts||(a.storage.accounts={}),a.storage.accountOrder||(a.storage.accountOrder=[]),a.storage.settings?(a.storage.settings.enableUnsafeFeatures===void 0&&(a.storage.settings.enableUnsafeFeatures=!1),a.storage.settings.enableCLI===void 0&&(a.storage.settings.enableCLI=a.storage.settings.showAccountNames!==!1),a.storage.settings.confirmBeforeDelete===void 0&&(a.storage.settings.confirmBeforeDelete=!0),a.storage.settings.addToSidebar===void 0&&(a.storage.settings.addToSidebar=!0),a.storage.settings.showAccountNames!==void 0&&delete a.storage.settings.showAccountNames):a.storage.settings={enableCLI:!0,confirmBeforeDelete:!0,enableUnsafeFeatures:!1,addToSidebar:!0};let H;function S(){return window.sendMessage?window.sendMessage?.(...arguments):(H||(H=fe?.(vendetta)),H?.(...arguments))}function N(t){return!t||!t.username?"Unknown Account":t.username}function ne(t){const c=a.storage.accounts||{},l=a.storage.accountOrder||[],d=parseInt(t);if(!isNaN(d)&&d>=1&&d<=l.length){const i=l[d-1];return c[i]?[i,c[i]]:null}return Object.entries(c).find(function([i,n]){return n.username.toLowerCase()===t.toLowerCase()||N(n).toLowerCase()===t.toLowerCase()})}function L(t){const c=(a.storage.accountOrder||[]).indexOf(t);return c>=0?c+1:null}function De(t){a.storage.accountOrder||(a.storage.accountOrder=[]),a.storage.accountOrder.includes(t)||a.storage.accountOrder.push(t)}function Ve(t){a.storage.accountOrder||(a.storage.accountOrder=[]);const c=a.storage.accountOrder.indexOf(t);c>-1&&a.storage.accountOrder.splice(c,1)}var Le={meta:vendetta.plugin,settings:ee,patches:[],onUnload(){this.patches.forEach(function(t){return t()}),this.patches=[]},onLoad(){const t=ze();this.patches.push(t);const c="Copy Token",l=P.before("render",T.findByProps("ScrollView").View,function(i){try{if(!a.storage.settings?.enableUnsafeFeatures)return;let n=V.findInReactTree(i,function(u){return u.key===".$UserProfileOverflow"});if(!n||!n.props||n.props.sheetKey!=="UserProfileOverflow")return;const o=n.props.content.props;if(o.options.some(function(u){return u?.label===c}))return;const s=A.getCurrentUser()?.id,r=Object.keys(n._owner.stateNode._keyChildMapping).find(function(u){return n._owner.stateNode._keyChildMapping[u]&&u.match(/(?<=\$UserProfile)\d+/)})?.slice?.(13)||s,y=T.findByProps("getToken").getToken();o.options.unshift({isDestructive:!0,label:c,onPress:function(){try{f.showToast(r===s?"Copied your token":`Copied token of ${o.header.title}`),de.setString(r===s?y:[Buffer.from(r).toString("base64").replaceAll("=",""),pe?.(+Date.now()-129384e4,!0)||"dummy",he?.(K,27)||"dummy"].join(".")),o.hideActionSheet()}catch(u){console.error(u),f.showToast("Failed to copy token",1)}}})}catch(n){console.error("Context menu patch error:",n)}});this.patches.push(l);const d={async mainCommand(i,n){try{const o={...I,interaction:{name:"/accswitcher",user:A.getCurrentUser()}};S?.({loggingName:"AccSwitcher main message",channelId:n.channel.id,embeds:[{color:m(),type:"rich",title:"\u{1F4F1} Account Switcher",description:a.storage.settings.addToSidebar?"Account Manager is available in your settings sidebar!\n\nQuick commands:\n\u2022 `/accswitcher login <#>` - Switch to account\n\u2022 `/accswitcher add` - Add current account\n\u2022 `/accswitcher list` - Show all accounts":"Opening Account Manager...\n\nQuick commands:\n\u2022 `/accswitcher login <#>` - Switch to account\n\u2022 `/accswitcher add` - Add current account\n\u2022 `/accswitcher list` - Show all accounts",footer:{text:a.storage.settings.addToSidebar?"Check your settings sidebar for Account Switcher":"Check plugin settings for the Account Manager interface"}}]},o),f.showToast(a.storage.settings.addToSidebar?"Check settings sidebar for Account Switcher":"Check plugin settings to access Account Manager",0)}catch(o){console.error("Main command error:",o),f.showToast("Check plugin settings to access Account Manager",1)}},async addAccount(i,n){try{const o={...I,interaction:{name:"/accswitcher add",user:A.getCurrentUser()}},s=T.findByProps("getToken").getToken(),r=A.getCurrentUser();if(!r){S?.({loggingName:"Add account error message",channelId:n.channel.id,embeds:[{color:m(),type:"rich",title:"\u274C Failed to Get Current User",description:"Could not retrieve current user information."}]},o);return}if(a.storage.accounts[r.id]){const p=L(r.id);S?.({loggingName:"Add account warning message",channelId:n.channel.id,embeds:[{color:m(),type:"rich",title:"\u26A0\uFE0F Account Already Saved",description:`Your current account **${p}. ${r.username}** is already saved.`}]},o);return}const y={id:r.id,username:r.username,discriminator:r.discriminator,avatar:r.avatar,displayName:r.globalName||r.username,token:s,addedAt:Date.now()};a.storage.accounts[r.id]=y,De(r.id);const u=L(r.id);S?.({loggingName:"Add account success message",channelId:n.channel.id,embeds:[{color:m(),type:"rich",title:"\u2705 Account Added Successfully",description:`**${u}. ${r.username}** has been saved.`,footer:{text:`Total accounts: ${Object.keys(a.storage.accounts).length}`}}]},o)}catch(o){console.error("Add account error:",o),f.showToast("Failed to add account",1)}},async login(i,n){try{const o={...I,interaction:{name:"/accswitcher login",user:A.getCurrentUser()}},s=new Map(i.map(function(h){return[h.name,h]})).get("account")?.value;if(!s){S?.({loggingName:"Login error message",channelId:n.channel.id,embeds:[{color:m(),type:"rich",title:"\u274C No Account Specified",description:"Please specify an account number, username, or ID."}]},o);return}const r=ne(s);if(!r){const h=(a.storage.accountOrder||[]).filter(function(w){return a.storage.accounts[w]}).map(function(w,C){return`${C+1}. ${N(a.storage.accounts[w])}`}).join(`
`);S?.({loggingName:"Login error message",channelId:n.channel.id,embeds:[{color:m(),type:"rich",title:"\u274C Account Not Found",description:`Could not find account "${s}".${h?`

**Available accounts:**
${h}`:"\n\nNo accounts saved yet. Use `/accswitcher add` first."}`}]},o);return}const[y,u]=r,p=L(y);S?.({loggingName:"Login process message",channelId:n.channel.id,embeds:[{color:m(),type:"rich",title:`\u{1F504} Switching to ${p}. ${N(u)}...`}]},o);try{await T.findByProps("login","logout","switchAccountToken").switchAccountToken(u.token),f.showToast(`Switched to ${p}. ${N(u)}!`,0)}catch(h){console.error("Switch error:",h),S?.({loggingName:"Login failure message",channelId:n.channel.id,embeds:[{color:m(),type:"rich",title:"\u274C Failed to switch accounts",description:`Error: ${h.message}`}]},o)}}catch(o){console.error("Login command error:",o),f.showToast("Failed to execute login command",1)}},listAccounts(i,n){try{const o={...I,interaction:{name:"/accswitcher list",user:A.getCurrentUser()}},s=a.storage.accounts||{},r=Object.keys(s).length;if(r===0){S?.({loggingName:"List accounts empty message",channelId:n.channel.id,embeds:[{color:m(),type:"rich",title:"\u{1F4DD} No Saved Accounts",description:"Use `/accswitcher add` to save your current account."}]},o);return}const y=(a.storage.accountOrder||[]).filter(function(u){return s[u]}).map(function(u,p){const h=s[u],w=N(h),C=new Date(h.addedAt).toLocaleDateString();return`**${p+1}.** ${w} - Added: ${C}`}).join(`
`);S?.({loggingName:"List accounts message",channelId:n.channel.id,embeds:[{color:m(),type:"rich",title:`\u{1F4DD} Saved Accounts (${r})`,description:y,footer:{text:"Use /accswitcher login <number or username> to switch accounts"}}]},o)}catch(o){console.error("List accounts error:",o),f.showToast("Failed to list accounts",1)}},removeAccount(i,n){try{const o={...I,interaction:{name:"/accswitcher remove",user:A.getCurrentUser()}},s=new Map(i.map(function(h){return[h.name,h]})).get("account")?.value;if(!s){S?.({loggingName:"Remove account error message",channelId:n.channel.id,embeds:[{color:m(),type:"rich",title:"\u274C No Account Specified",description:"Please specify an account number, username, or ID to remove."}]},o);return}const r=ne(s);if(!r){const h=(a.storage.accountOrder||[]).filter(function(w){return a.storage.accounts[w]}).map(function(w,C){return`${C+1}. ${N(a.storage.accounts[w])}`}).join(`
`);S?.({loggingName:"Remove account error message",channelId:n.channel.id,embeds:[{color:m(),type:"rich",title:"\u274C Account Not Found",description:`Could not find account "${s}".${h?`

**Available accounts:**
${h}`:`

No accounts saved yet.`}`}]},o);return}const[y,u]=r,p=`${L(y)}. ${N(u)}`;delete a.storage.accounts[y],Ve(y),S?.({loggingName:"Remove account success message",channelId:n.channel.id,embeds:[{color:m(),type:"rich",title:"\u{1F5D1}\uFE0F Account Removed",description:`**${p}** has been removed from saved accounts.`,footer:{text:`Remaining accounts: ${Object.keys(a.storage.accounts).length}`}}]},o)}catch(o){console.error("Remove account error:",o),f.showToast("Failed to remove account",1)}},getCurrentToken(i,n){try{const o={...I,interaction:{name:"/accswitcher token",user:A.getCurrentUser()}};if(!a.storage.settings?.enableUnsafeFeatures){S?.({loggingName:"Get token disabled message",channelId:n.channel.id,embeds:[{color:m(),type:"rich",title:"\u{1F512} Unsafe Features Disabled",description:"Token access is disabled. Enable 'Unsafe Features' in plugin settings to use this command."}]},o);return}const{getToken:s}=T.findByProps("getToken"),r=s();S?.({loggingName:"Get token message",channelId:n.channel.id,embeds:[{color:m(),type:"rich",title:"\u{1F511} Current Account Token",description:`\`${r}\``,footer:{text:"\u26A0\uFE0F Keep your token secure and never share it!"}}]},o)}catch(o){console.error("Get token error:",o),f.showToast("Failed to get current token",1)}}};try{[{type:1,inputType:1,applicationId:"-1",execute:d.mainCommand,name:"accswitcher",description:"Open Account Switcher (check plugin settings)",options:[]},{type:1,inputType:1,applicationId:"-1",execute:d.addAccount,name:"accswitcher add",description:"Add your current account to saved accounts",options:[]},{type:1,inputType:1,applicationId:"-1",execute:d.login,name:"accswitcher login",description:"Switch to a saved account",options:[{required:!0,type:3,name:"account",description:"Account number, username, or ID to switch to"}]},{type:1,inputType:1,applicationId:"-1",execute:d.listAccounts,name:"accswitcher list",description:"Show all saved accounts",options:[]},{type:1,inputType:1,applicationId:"-1",execute:d.removeAccount,name:"accswitcher remove",description:"Remove a saved account",options:[{required:!0,type:3,name:"account",description:"Account number, username, or ID to remove"}]},{type:1,inputType:1,applicationId:"-1",execute:d.getCurrentToken,name:"accswitcher token",description:"Get your current account token (requires unsafe features)",options:[]}].forEach(function(i){try{se.registerCommand(i)}catch(n){console.error(`Failed to register command ${i.name}:`,n)}}),console.log("Account Switcher plugin loaded successfully")}catch(i){console.error("Failed to register commands:",i)}}};return D.EMBED_COLOR=m,D.default=Le,Object.defineProperty(D,"__esModule",{value:!0}),D})({},vendetta.ui,vendetta.commands,vendetta.metro,vendetta.utils,vendetta.metro.common.clipboard,vendetta.patcher,vendetta.ui.toasts,vendetta.plugin,vendetta.metro.common,vendetta.storage,vendetta.ui.alerts,vendetta.ui.assets,vendetta.ui.components,vendetta);
;
      return moreAltsModule?.default || moreAltsModule;
    } catch (e) {
      console.warn("[QoL-AIO] Error initializing MoreAlts:", e);
      return null;
    }
  }

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
        (metro?.findByProps && metro.findByProps("getStatus", "isMobileOnline")) ||
        (metro?.findByProps && metro.findByProps("getState", "getStatus")) ||
        (metro?.findByProps && metro.findByProps("getClientStatuses"));

      const state = PresenceStore?.getState ? PresenceStore.getState() : getCachedPresenceState();

      let clientStatuses = null;
      if (PresenceStore?.getClientStatuses) {
        clientStatuses = PresenceStore.getClientStatuses(userId);
      }
      if (!clientStatuses && state?.clientStatuses?.[userId]) {
        clientStatuses = state.clientStatuses[userId];
      }
      if (!clientStatuses && state?.presences?.[userId]?.clientStatus) {
        clientStatuses = state.presences[userId].clientStatus;
      }

      const res = {};
      if (clientStatuses && typeof clientStatuses === "object") {
        Object.keys(clientStatuses).forEach((k) => {
          if (clientStatuses[k] && clientStatuses[k] !== "offline") {
            res[k] = clientStatuses[k];
          }
        });
      }

      const userStatus =
        (PresenceStore?.getStatus && PresenceStore.getStatus(userId)) ||
        state?.statuses?.[userId] ||
        state?.presences?.[userId]?.status ||
        (clientStatuses && Object.keys(clientStatuses).length > 0 ? "online" : null);

      const isMobile =
        (typeof PresenceStore?.isMobileOnline === "function" && PresenceStore.isMobileOnline(userId)) ||
        (typeof PresenceStore?.isMobile === "function" && PresenceStore.isMobile(userId)) ||
        (state?.mobileOnlineUsers && (state.mobileOnlineUsers[userId] || (typeof state.mobileOnlineUsers.has === "function" && state.mobileOnlineUsers.has(userId)))) ||
        (state?.mobileStatuses && state.mobileStatuses[userId]) ||
        (clientStatuses && !!clientStatuses.mobile);

      if (isMobile && userStatus && userStatus !== "offline") {
        res.mobile = res.mobile || userStatus;
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

  // Extract recipient userId from any DM channel row tree or arguments
  function extractDMUserId(tree, args) {
    try {
      const metro = vendetta?.metro;
      const ChannelStore =
        (metro?.findByStoreName && metro.findByStoreName("ChannelStore")) ||
        (metro?.findByProps && metro.findByProps("getChannel", "getDMFromUserId"));

      // 1. Check args first
      if (args) {
        const a0 = args[0];
        const ch = a0?.channel || a0;
        if (ch) {
          if (ch.guild_id || ch.guildId) return null;
          const recipients = ch.recipients || ch.rawRecipients;
          if (Array.isArray(recipients) && recipients.length === 1) {
            return typeof recipients[0] === "string" ? recipients[0] : recipients[0]?.id;
          }
          if (typeof ch.getRecipientId === "function") {
            const id = ch.getRecipientId();
            if (id) return id;
          }
          if (ch.recipientId) return ch.recipientId;
        }
      }

      if (!tree) return null;

      // 2. Search tree for channel object
      const chNode = findInReactTree(tree, (m) => m?.props?.channel?.id || m?.props?.channel?.recipients);
      let channel = chNode?.props?.channel;

      // 3. Search tree for channelId and lookup in ChannelStore
      if (!channel) {
        const chIdNode = findInReactTree(
          tree,
          (m) =>
            (m?.props?.channelId && typeof m.props.channelId === "string") ||
            (m?.props?.channel_id && typeof m.props.channel_id === "string")
        );
        const chId = chIdNode?.props?.channelId || chIdNode?.props?.channel_id;
        if (chId && ChannelStore?.getChannel) {
          channel = ChannelStore.getChannel(chId);
        }
      }

      if (channel) {
        if (channel.guild_id || channel.guildId) return null;
        const recipients = channel.recipients || channel.rawRecipients;
        if (Array.isArray(recipients) && recipients.length === 1) {
          return typeof recipients[0] === "string" ? recipients[0] : recipients[0]?.id;
        }
        if (typeof channel.getRecipientId === "function") {
          const id = channel.getRecipientId();
          if (id) return id;
        }
        if (channel.recipientId) return channel.recipientId;
      }

      // 4. Direct user or userId props in tree
      const userNode = findInReactTree(tree, (m) => m?.props?.user?.id && !m?.props?.guildId);
      if (userNode?.props?.user?.id) return userNode.props.user.id;

      const idNode = findInReactTree(tree, (m) => m?.props?.userId && typeof m.props.userId === "string");
      if (idNode?.props?.userId) return idNode.props.userId;

      const recipNode = findInReactTree(tree, (m) => m?.props?.recipient?.id);
      if (recipNode?.props?.recipient?.id) return recipNode.props.recipient.id;

      return null;
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
      { key: "messageLogger", label: "Message Logger", desc: "Keep deleted messages (*deleted*) and stack all edit versions chronologically" },
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
      { key: "moreAlts", label: "More Alts! (ApexTeam / Win8.1VMUser)", desc: "Unlimited account switcher: add alts, switch accounts, or manage tokens via /accswitcher" },
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

          // B. Hook GuildMemberRow (server member list fallback)
          const Rows = findByProps("GuildMemberRow");
          if (Rows?.GuildMemberRow && after) {
            unpatches.push(
              after("type", Rows.GuildMemberRow, ([{ user }], res) => {
                if (!storage.platformIndicators || !user || !res) return res;
                if (findInReactTree(res, (c) => c?.key === "QoLPlatformIconsGMR" || c?.key === "QoLPlatformIconsWrap" || c?.key === "QoLPI")) return res;
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

          // C. Hook DisplayName & DefaultName (profiles)
          const DisplayName = findByProps("DisplayName");
          if (DisplayName && after) {
            const key = DisplayName.DisplayName ? "DisplayName" : "default";
            unpatches.push(
              after(key, DisplayName, ([props], res) => {
                if (!storage.platformIndicators || !props || !props.user || !res) return res;
                const userId = props.user.id;
                if (findInReactTree(res, (m) => m?.key === "QoLPlatformIconsDN" || m?.key === "QoLPlatformIconsWrap" || m?.key === "QoLPI")) return res;
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

          // D. Hook ChannelHeader (DM top bar)
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
                      if (findInReactTree(headerRes, (m) => m?.key === "QoLPlatformIconsHeader" || m?.key === "QoLPlatformIconsWrap" || m?.key === "QoLPI")) return headerRes;

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
              const isGuild = findInReactTree(
                res,
                (m) =>
                  (m?.props?.guildId && typeof m.props.guildId === "string" && m.props.guildId !== "") ||
                  (m?.props?.channel?.guild_id && typeof m.props.channel.guild_id === "string" && m.props.channel.guild_id !== "")
              );
              if (isGuild) return res;

              const userId = extractDMUserId(res, args);
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
                      const isGuild = findInReactTree(
                        props,
                        (m) =>
                          (m?.props?.guildId && typeof m.props.guildId === "string" && m.props.guildId !== "") ||
                          (m?.props?.channel?.guild_id && typeof m.props.channel.guild_id === "string" && m.props.channel.guild_id !== "")
                      );
                      if (isGuild) return;

                      const userId = extractDMUserId(props, args);
                      if (!userId) return;

                      // Strategy A: MSMA rowChildren path
                      const root = props?.children?.props?.children;
                      const rowChildren = root?.props?.children;
                      if (Array.isArray(rowChildren) && rowChildren.length >= 2) {
                        const nameArea = rowChildren[2]?.props?.children?.[0];
                        if (nameArea && nameArea.props) {
                          if (Array.isArray(nameArea.props.children)) {
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
                          } else if (typeof nameArea.props.children === "string") {
                            nameArea.props.children = [
                              nameArea.props.children,
                              React.createElement(PresenceUpdatedContainer, {
                                key: "QoLPlatformIconsDM",
                                userId: userId,
                                size: 14,
                              }),
                            ];
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
                      } else if (nameContainer && nameContainer.props && nameContainer.props.children) {
                        nameContainer.props.children = [
                          nameContainer.props.children,
                          React.createElement(PresenceUpdatedContainer, {
                            key: "QoLPlatformIconsDM",
                            userId: userId,
                            size: 14,
                          }),
                        ];
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
          const UserStore = (metro?.findByStoreName && metro.findByStoreName("UserStore")) || findByProps("getCurrentUser");
          const FluxDispatcher = (metro?.common && metro.common.FluxDispatcher) || findByProps("dispatch", "subscribe");

          if (FluxDispatcher && before) {
            unpatches.push(
              before("dispatch", FluxDispatcher, ([event]) => {
                if (!event || !storage.messageLogger) return;

                // DELETED MESSAGES
                if (event.type === "MESSAGE_DELETE") {
                  if (event.__qol_cleanup) return;
                  try {
                    const channel = ChannelMessages?._channelMessages?.[event.channelId] || (ChannelMessages?.get && ChannelMessages.get(event.channelId));
                    const message = channel?.get ? channel.get(event.id) : channel?._array?.find((m) => m.id === event.id);
                    if (!message || message.state === "SEND_FAILED" || (message.author && message.author.id === "1")) return;

                    // If current user is deleting their own message, allow normal deletion without error
                    const currentUserId = UserStore?.getCurrentUser?.()?.id;
                    if (currentUserId && message.author?.id === currentUserId) return;

                    const raw = typeof message.toJS === "function" ? message.toJS() : { ...message };
                    return [
                      {
                        type: "MESSAGE_UPDATE",
                        message: {
                          ...raw,
                          __qol_deleted: true,
                        },
                      },
                    ];
                  } catch (_) {
                    return;
                  }
                }

                // EDITED MESSAGES (STACK ALL VERSIONS CHRONOLOGICALLY)
                if (event.type === "MESSAGE_UPDATE" && event.message && event.message.content) {
                  try {
                    const channelId = event.message.channel_id || event.message.channelId;
                    const channel = ChannelMessages?._channelMessages?.[channelId] || (ChannelMessages?.get && ChannelMessages.get(channelId));
                    const existing = channel?.get ? channel.get(event.message.id) : channel?._array?.find((m) => m.id === event.message.id);

                    if (existing && existing.content && existing.content !== event.message.content && !event.message.__qol_edit_applied) {
                      let history = existing.__qol_edits;
                      if (!Array.isArray(history)) {
                        const base = existing.content.startsWith("*(deleted)* ") ? existing.content.slice(12) : existing.content;
                        history = [base];
                      }

                      const newVersion = event.message.content;
                      if (!history.includes(newVersion)) {
                        history.push(newVersion);
                      }
                      existing.__qol_edits = history;

                      // Stack all edit versions with previous versions struck through
                      const stacked = history
                        .map((ver, idx) => {
                          if (idx === history.length - 1) return ver;
                          return ver
                            .split("\n")
                            .map((line) => (line.startsWith("~~") && line.endsWith("~~") ? line : `~~${line}~~`))
                            .join("\n");
                        })
                        .join("\n");

                      event.message.content = stacked;
                      event.message.__qol_edits = history;
                      event.message.__qol_edit_applied = true;
                    }
                  } catch (_) {}
                }
              })
            );
          }

          if (MessageRecordUtils && MessageRecordUtils.updateMessageRecord && instead) {
            unpatches.push(
              instead("updateMessageRecord", MessageRecordUtils, function ([oldRecord, newProps], orig) {
                try {
                  if (newProps && newProps.__qol_deleted && MessageRecordUtils.createMessageRecord) {
                    return MessageRecordUtils.createMessageRecord(newProps, oldRecord ? oldRecord.reactions : undefined);
                  }
                } catch (_) {}
                return orig.apply(this, [oldRecord, newProps]);
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
                if (!row || !data || data.rowType !== 1) return;

                if (storage.messageLogger && data.message && data.message.__qol_deleted) {
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
        // =========================================================================
        // 16. MORE ALTS (BY APEXTEAM / WIN8.1VMUSER)
        // =========================================================================
        try {
          if (storage.moreAlts !== false) {
            moreAltsInstance = loadMoreAlts(vendetta);
            if (moreAltsInstance && typeof moreAltsInstance.onLoad === "function") {
              moreAltsInstance.onLoad();
              console.log("[QoL-AIO] MoreAlts loaded successfully.");
            }
          }
        } catch (e) {
          console.warn("[QoL-AIO] Error loading MoreAlts:", e);
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
