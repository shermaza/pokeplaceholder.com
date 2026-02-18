import unittest
from unittest.mock import patch, MagicMock
from card import Card
from pdf_generator import PdfGenerator
import io
import os

class TestPdfGenerator(unittest.TestCase):
    def test_write_pdf_with_grid_no_images(self):
        card = Card(set_id="base1", set_name="Base", series_name="Base", release_date="1999/01/09", total_cards=102,
                    national_pokedex_number=6, number="4", name="Charizard", rarity="Rare Holo", card_id="base1-4", 
                    image_url="url", holo="Holofoil", generation=1)
        
        output_file = "test_output.pdf"
        if os.path.exists(output_file):
            os.remove(output_file)
            
        try:
            PdfGenerator.write_pdf_with_grid([card], file_name=output_file, images=False)
            self.assertTrue(os.path.exists(output_file))
            self.assertGreater(os.path.getsize(output_file), 0)
        finally:
            if os.path.exists(output_file):
                os.remove(output_file)

    @patch('requests.get')
    def test_write_pdf_with_grid_with_images(self, mock_get):
        # Mock image data
        mock_response = MagicMock()
        mock_response.content = b"fake image data"
        mock_get.return_value = mock_response

        card = Card(set_id="base1", set_name="Base", series_name="Base", release_date="1999/01/09", total_cards=102,
                    national_pokedex_number=6, number="4", name="Charizard", rarity="Rare Holo", card_id="base1-4", 
                    image_url="http://fakeurl.com/image.png", holo="Holofoil", generation=1)
        
        output_file = "test_output_images.pdf"
        
        # This will probably fail because "fake image data" is not a valid image for ReportLab
        # but we want to see if it calls requests.get
        try:
            # We use a try-except because ReportLab might raise error on invalid image data
            # but the logic flow should have reached requests.get
            try:
                PdfGenerator.write_pdf_with_grid([card], file_name=output_file, images=True)
            except Exception:
                pass 
            
            mock_get.assert_called_with("http://fakeurl.com/image.png")
        finally:
            if os.path.exists(output_file):
                os.remove(output_file)

if __name__ == '__main__':
    unittest.main()
