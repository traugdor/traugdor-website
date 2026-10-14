---
pitch: Mods for a game I love, two released and one in development.
status: Expanded Stomach and Smooth Stone Paths released; Remedy and Ruin in development, targeting end of November 2026
tech:
  - C#
  - Vintage Story modding API
  - Harmony
repos:
  - label: ExpandedStomach
    url: https://github.com/traugdor/ExpandedStomach
  - label: SmoothStonePaths
    url: https://github.com/traugdor/SmoothStonePaths
  - label: Remedy-And-Ruin (in development)
    url: https://github.com/traugdor/Remedy-And-Ruin
---

I like playing Vintage Story. It reminds me of what Minecraft used to be, full of mystery and wonder. The game is still in early access, so parts of it are only partly implemented or missing entirely. Some ambitious players try to fill those gaps with mods, and I'm one of them.

## Expanded Stomach

Expanded Stomach started as a personal health journey. It lets the player overeat, and overeating carries a risk: you can get fat in-game, which lowers your movement speed and makes the game harder.

The more you overeat, the more your capacity grows. That makes it easier to keep overeating, and easy to eat too much food in one sitting and rob other players of a valuable resource. Over time the mod has grown to support other mods for the game, and the latest version has more than 3,300 downloads. It is available on the [Vintage Story Mod DB](https://mods.vintagestory.at/expandedstomach).

## Smooth Stone Paths

Smooth Stone Paths gives the vanilla stone path and stone path slab soft, natural edges where they meet the terrain around them. Wherever a path touches grass, sand, dirt, or gravel, a fringe of that material fades onto the edge of the path, and inner corners get their own small piece. The grass fringe takes the local grass color, so it follows climate and seasons like the grass around it.

It works automatically. There are no new blocks to craft or place, and it also updates paths you built before installing it. It is purely visual and does not change gameplay. It isn't compatible with mods that change the height of the stone path, such as Stonepathfull.

Under the hood, the mod swaps the stone path for a small custom block class that hooks the client's chunk meshing and adds alpha-masked overlay pieces based on the eight surrounding blocks. It is available on the [Vintage Story Mod DB](https://mods.vintagestory.at/smoothstonepaths).

## Remedy and Ruin (in development)

I looked over the existing alchemy mods and found them too fantasy-based for a game with a pseudo-realistic theme. So I began researching the herbal uses of the flora and fungi already in the game. That research produced six distinct poisons you can create and a handful of remedies.

Remedy and Ruin is in development, and I expect to release it by the end of November 2026.
