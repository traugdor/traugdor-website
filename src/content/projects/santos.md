---
pitch: A learning project that grew into an operating system with its own kernel.
status: Learning goal met; FAT16 and FAT32 support unfinished
tech:
  - C
  - x86-64 assembly (NASM)
  - Bare-metal ELF kernel
  - FAT12
repos:
  - label: github.com/traugdor/SantOS
    url: https://github.com/traugdor/SantOS
---

I had studied x86 assembly and still had no idea how an operating system actually worked. I knew the theory: a bootloader loads the operating system, and bootloaders are usually hard-coded to one OS. What I could not explain was how the machine gets from that first sector to running the OS's own code. SantOS is how I found out.

## Starting out with an AI assistant

I started in Windsurf and asked its Cascade assistant to find resources on the problem. I copied some code and started debugging, leaning on the assistant to look things up while I worked. As the project grew I learned to drive a floppy disk controller through IRQs and to convert LBA addresses to CHS. Then I learned how a two-stage bootloader gets the machine into 64-bit mode, and from there it was a lot of work on the second stage, using boilerplate from several sources. I spent weeks debugging memory until the compiled kernel finally loaded and ran.

## Moving to C

Once I left assembly and worked in C, which I know much better, things went faster. I read up on memory and disk management and kept building. Today SantOS has:

- a three-stage bootloader that enters 64-bit long mode, with FAT12 fully working
- a 64-bit kernel with a physical memory manager, paging, and a heap
- drivers for the VGA text screen, PS/2 keyboard, PIT timer, and the floppy controller with DMA
- a system call interface on `INT 0x80`
- a loader for 64-bit ELF programs stored on the FAT12 disk

## Userspace

To have something to run on the kernel, I put programs on the disk image: a shell with piping, history, and scripts, a text editor called SEdit, and a small demo program. The AI wrote many of those programs so that I had something to test the kernel with. I spent a good deal of time tweaking SEdit because of that. I also started a prototype assembler, `sasm`, that turns x86 assembly into a program. I have not tested it in a while, so treat it as experimental.

## Where it stands

FAT16 and FAT32 support are still unfinished. I'm happy with where it is. I learned a lot, dusted off old skills, and did what I set out to do: build a bootable kernel.

This project is and ever only was a learning project. If you have contributions you would like to make, please feel free to make them. Just be prepared for me to ask a LOT of questions.
