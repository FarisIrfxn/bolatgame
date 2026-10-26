"""Reference staging must never substitute another character with the same basename."""
import importlib.util
import os
from pathlib import Path
import tempfile
import unittest

spec = importlib.util.spec_from_file_location("qwen_gen", Path(__file__).parents[1] / "tools/qwen_gen.py")
qwen = importlib.util.module_from_spec(spec)
spec.loader.exec_module(qwen)

class ReferenceStagingTest(unittest.TestCase):
    def test_same_basename_keeps_both_character_references(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            qwen.COMFY = root / "comfy"
            (qwen.COMFY / "input").mkdir(parents=True)
            a, b = root / "bowat/idle_side.png", root / "qish/idle_side.png"
            a.parent.mkdir(); b.parent.mkdir()
            a.write_bytes(b"sloth-reference"); b.write_bytes(b"human-reference")
            os.utime(b, (10, 10))  # A valid reference can be older than the other character.
            staged_a, staged_b = qwen.stage_image(a), qwen.stage_image(b)
            self.assertNotEqual(staged_a, staged_b)
            self.assertEqual((qwen.COMFY / "input" / staged_a).read_bytes(), a.read_bytes())
            self.assertEqual((qwen.COMFY / "input" / staged_b).read_bytes(), b.read_bytes())
            self.assertEqual(qwen.stage_image(a), staged_a)

if __name__ == "__main__": unittest.main()
