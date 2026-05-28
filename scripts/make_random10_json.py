#!/usr/bin/env python3

import argparse
import json
import random
from pathlib import Path
from typing import Any, Dict, List


def pick_n(items: List[Any], n: int) -> List[Any]:
    if len(items) <= n:
        return list(items)
    # Sample without replacement
    return random.sample(items, n)


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Create a reduced emoji_videos_plots.json with N random samples per emoji."
    )
    parser.add_argument(
        "--input",
        default="resrc/emoji_videos_plots.json",
        help="Input JSON path (default: resrc/emoji_videos_plots.json)",
    )
    parser.add_argument(
        "--output",
        default="resrc/emoji_videos_plots_random10.json",
        help="Output JSON path (default: resrc/emoji_videos_plots_random10.json)",
    )
    parser.add_argument(
        "-n",
        "--num",
        type=int,
        default=10,
        help="Random samples per emoji (default: 10)",
    )
    parser.add_argument(
        "--seed",
        type=int,
        default=None,
        help="Optional RNG seed for reproducible output",
    )
    args = parser.parse_args()

    if args.seed is not None:
        random.seed(args.seed)

    in_path = Path(args.input)
    out_path = Path(args.output)

    groups = json.loads(in_path.read_text(encoding="utf-8"))
    if not isinstance(groups, list):
        raise SystemExit("Input JSON must be a list of emoji groups.")

    out_groups: List[Dict[str, Any]] = []
    for group in groups:
        if not isinstance(group, dict):
            continue
        samples = group.get("samples") or []
        if not isinstance(samples, list):
            samples = []

        new_group: Dict[str, Any] = dict(group)
        new_group["samples"] = pick_n(samples, args.num)
        out_groups.append(new_group)

    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(out_groups, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"Wrote {out_path} with {args.num} samples per emoji (seed={args.seed}).")


if __name__ == "__main__":
    main()

