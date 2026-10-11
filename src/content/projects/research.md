---
pitch: Small research projects on persistence, huge numbers, and pi.
status: MultiplicationPersistence and piLeibniz-GPU working; ExtremeLargeNumberMath abandoned
tech:
  - C#
  - Python
  - GPU computing (CUDA, ROCm, Metal)
repos:
  - label: MultiplicationPersistence
    url: https://github.com/traugdor/MultiplicationPersistence
  - label: ExtremeLargeNumberMath
    url: https://github.com/traugdor/ExtremeLargeNumberMath
  - label: piLeibniz-GPU
    url: https://github.com/traugdor/piLeibniz-GPU
---

## MultiplicationPersistence

I saw this problem in a Numberphile video and found the concept interesting. A number's multiplication persistence is how many times you multiply its digits together, then do the same to the product, until you reach a single digit. Instead of working it out by hand, I wrote a program to search a range of numbers for the largest persistence. It splits the range across your CPU cores and reports the number with the most steps.

What I found is that few numbers have a large persistence. The trick is to skip numbers that contain a 0 or a 5, since those almost always collapse to a single digit as soon as they appear. I want to recode it in Python to run on the GPU.

## ExtremeLargeNumberMath

I wanted to do math with numbers bigger than a float or a double can hold. The library keeps numbers as strings of digits and can add and multiply them. I soon found that the algorithms for multiplying and dividing numbers of that size quickly were too complex for my level of math, so I abandoned the project.

## piLeibniz-GPU

This was my first foray into GPU programming with Python that was not writing a node for ComfyUI. It calculates pi with the Leibniz series, a task expensive enough to double as a benchmark. It looks for an NVIDIA GPU first, then an AMD GPU, then Apple Silicon, and falls back to the CPU. When it finishes, it prints how many digits are correct and how long it took.

Because GPUs process data faster than CPUs, it became clear to me that the GPU is the better place to do math, at least until CPUs come with special arithmetic cores that can compete with a GPU in speed and accuracy. What I learned here I will use to recode MultiplicationPersistence.
