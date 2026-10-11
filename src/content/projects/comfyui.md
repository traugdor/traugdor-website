---
pitch: ComfyUI nodes I built because I wanted them, from workflow tools to Flux upscaling on a modest GPU.
status: Released
tech:
  - Python
  - ComfyUI
  - GGUF
  - FFmpeg (Riffusion)
repos:
  - label: ComfyUI-quadMoons-nodes
    url: https://github.com/traugdor/ComfyUI-quadMoons-nodes
  - label: ComfyUI-UltimateSDUpscale-GGUF
    url: https://github.com/traugdor/ComfyUI-UltimateSDUpscale-GGUF
  - label: ComfyUI-Riffusion
    url: https://github.com/traugdor/ComfyUI-Riffusion
---

## How it started

My friend HarroweD from the CivitAI community asked me for help coding a ComfyUI plugin for his Harrlogos LoRA. I told him I knew Python and JavaScript and could probably help. We spent call after call on Discord, with me sharing my screen while I worked on the code. He watched and told me what to change, what to improve, and what to add or remove. We ended up with a working node, and we uploaded it to the ComfyUI Manager node library for download.

I wanted more. I started building my own nodes, digging into ComfyUI's source code to see what made it work.

## quadMoons nodes

This is the repository for the nodes I wanted and could not find anywhere. Every node does one specific job, shaped by how I wanted the interface to work while I experimented with Stable Diffusion models. Whenever I found myself chaining several nodes together, I made one node to replace them.

Some of what is in it:

- **The BUTTON:** starts or cancels your queue, or reboots ComfyUI entirely.
- **CLIP External Text Encoder:** the regular text encoder, but the prompt text is an input by default, which works well with wildcard and other dynamic prompt nodes.
- **KSampler - Extra Outputs:** a sampler with a built-in latent upscaler and a seed output you can reuse.
- **KSampler For Each:** samples a batch one latent at a time to save VRAM on smaller GPUs.
- **Change Background:** works with Impact Pack's segmentation output to repaint a background in one pass, then resamples the whole image so the new background and the subject blend.

## Ultimate SD Upscale for GGUF models

I made this after Flux Dev came out. I wanted to upscale my images with Flux, but I only had a 6600XT to work with. The node adds GGUF model support to the Ultimate SD Upscale node.

## Riffusion

I built this after the first Riffusion model went up on CivitAI. I saw how the plugin worked for AUTOMATIC1111 and decided to replicate it for ComfyUI. It adds a Riffusion node in the audio category that generates audio from text, and it needs FFmpeg for some output formats. Other people have since sent fixes for it.
