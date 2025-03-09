import io
import logging
import boto3
from card import Card
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.pdfgen import canvas


logger = logging.getLogger()
logger.setLevel(logging.INFO)

class PdfGenerator:

    @staticmethod
    def write_pdf_with_grid(cards: list[Card], bucket_name: str, file_name: str):
        """
        Generates a single PDF with 2.5" x 3.5" cells in a grid layout.
        :param bucket_name:
        :param cards: List of data dictionaries to fill the grid
        :param file_name: The name of the output PDF file
        """
        buffer = io.BytesIO()
        page_width, page_height = letter
        cell_width, cell_height = 2.5 * inch, 3.5 * inch

        # Adjust the margins for better spacing
        top_margin = 0.25 * inch
        bottom_margin = 0.25 * inch
        side_margin = 0.5 * inch

        pdf_canvas = canvas.Canvas(buffer, pagesize=letter)

        # Starting positions for the grid
        x_start = side_margin
        y_start = page_height - top_margin
        x, y = x_start, y_start

        for card_info in cards:
            # Draw a cell border (corrected to align cell height properly)
            pdf_canvas.rect(x, y - cell_height, cell_width, cell_height)

            # Prepare the text to be displayed in the cell
            text_lines = [
                f"#{card_info.national_pokedex_number}" if card_info.national_pokedex_number else "",
                f"{card_info.name}",
                f"{card_info.series_name}",
                f"{card_info.set_name}",
                f"{card_info.number}/{card_info.total_cards}",
                f"{card_info.holo}",
                f"Released: {card_info.release_date}",
                f"Market Value: ${card_info.market:,.2f}" if isinstance(card_info.market,
                                                                        (int,
                                                                         float)) else f"Market Value: {card_info.market}"
            ]

            # Calculate vertical starting position to center the block of text
            line_height = 13  # Approximate height of each line
            text_block_height = len(text_lines) * line_height
            text_y_start = y - cell_height + (cell_height - text_block_height) / 2

            # Draw each line of text horizontally centered
            for index, line in enumerate(text_lines):
                # Calculate horizontal starting position to center the line
                text_width = pdf_canvas.stringWidth(line, "Helvetica", 10)  # Assumes font size of 10
                x_center = x + (cell_width - text_width) / 2

                # Calculate the vertical position for the line
                current_line_y = text_y_start + text_block_height - (line_height * (index + 1))

                # Draw the line
                pdf_canvas.drawString(x_center, current_line_y, line)

            # Move to the next cell position
            x += cell_width

            # Start a new row if the next cell exceeds page width
            if x + cell_width > page_width - side_margin:
                x = x_start
                y -= cell_height

            # Start a new page if the next row exceeds the page height
            if y - cell_height < bottom_margin:
                pdf_canvas.showPage()
                x, y = x_start, y_start

        pdf_canvas.save()
        buffer.seek(0)

        logger.info(f"Wrote {file_name} to buffer. Uploading to S3.")
        s3_client = boto3.client('s3')
        s3_client.upload_fileobj(buffer, bucket_name, file_name)
        logger.info(f"Uploaded {file_name} to S3.")
