import unittest
from set import Set

class TestSet(unittest.TestCase):
    def test_set_initialization(self):
        s = Set(
            id="base1",
            name="Base",
            release_date="1999/01/09",
            series="Base",
            total=102
        )
        self.assertEqual(s.id, "base1")
        self.assertEqual(s.name, "Base")
        self.assertEqual(s.release_date, "1999/01/09")
        self.assertEqual(s.series, "Base")
        self.assertEqual(s.total, 102)

if __name__ == '__main__':
    unittest.main()
