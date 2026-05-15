from reportlab.lib.pagesizes import letter, A4
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.graphics.barcode import qr
from reportlab.graphics.shapes import Drawing
from reportlab.graphics import renderPDF
import os
from io import BytesIO

def generate_qr_drawing(data, size=1.5*inch):
    qr_code = qr.QrCodeWidget(data)
    bounds = qr_code.getBounds()
    width = bounds[2] - bounds[0]
    height = bounds[3] - bounds[1]
    d = Drawing(size, size, transform=[size/width, 0, 0, size/height, 0, 0])
    d.add(qr_code)
    return d

def generate_event_badge(registration):
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=(3.5*inch, 5*inch), topMargin=0.2*inch, bottomMargin=0.2*inch)
    styles = getSampleStyleSheet()
    
    elements = []
    
    # Event Name
    elements.append(Paragraph(registration.event.title, ParagraphStyle('EventName', parent=styles['Heading1'], alignment=1, fontSize=16, textColor=colors.HexColor("#6C3CE1"))))
    elements.append(Spacer(1, 0.1*inch))
    
    # Attendee Name
    elements.append(Paragraph(registration.user.name, ParagraphStyle('Name', parent=styles['Normal'], alignment=1, fontSize=14, fontName='Helvetica-Bold')))
    elements.append(Spacer(1, 0.05*inch))
    
    # Role/Category
    elements.append(Paragraph("DELEGATE", ParagraphStyle('Role', parent=styles['Normal'], alignment=1, fontSize=10, textColor=colors.grey)))
    elements.append(Spacer(1, 0.2*inch))
    
    # QR Code
    qr_data = registration.qr_codes[0].qr_data if registration.qr_codes else "NO_QR"
    elements.append(generate_qr_drawing(qr_data, size=1.8*inch))
    elements.append(Spacer(1, 0.2*inch))
    
    # Venue & Date
    elements.append(Paragraph(registration.event.venue, ParagraphStyle('Venue', parent=styles['Normal'], alignment=1, fontSize=8)))
    elements.append(Paragraph(f"{registration.event.start_date}", ParagraphStyle('Date', parent=styles['Normal'], alignment=1, fontSize=8)))
    
    doc.build(elements)
    buffer.seek(0)
    return buffer

def generate_entry_pass(registration):
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4)
    styles = getSampleStyleSheet()
    
    elements = []
    elements.append(Paragraph(f"ENTRY PASS: {registration.event.title}", styles['Heading1']))
    elements.append(Spacer(1, 0.2*inch))
    
    data = [
        ["Attendee Name:", registration.user.name],
        ["Email:", registration.user.email],
        ["Event Date:", f"{registration.event.start_date} to {registration.event.end_date}"],
        ["Venue:", registration.event.venue],
        ["Registration ID:", str(registration.id)]
    ]
    
    t = Table(data, colWidths=[2*inch, 3*inch])
    t.setStyle(TableStyle([
        ('GRID', (0,0), (-1,-1), 0.5, colors.grey),
        ('PADDING', (0,0), (-1,-1), 6),
        ('BACKGROUND', (0,0), (0,-1), colors.whitesmoke)
    ]))
    elements.append(t)
    elements.append(Spacer(1, 0.5*inch))
    
    # QR Code
    qr_data = registration.qr_codes[0].qr_data if registration.qr_codes else "NO_QR"
    elements.append(generate_qr_drawing(qr_data, size=2*inch))
    
    doc.build(elements)
    buffer.seek(0)
    return buffer

def generate_certificate(registration):
    buffer = BytesIO()
    # Landscape A4
    doc = SimpleDocTemplate(buffer, pagesize=(A4[1], A4[0]), topMargin=0.5*inch)
    styles = getSampleStyleSheet()
    
    elements = []
    
    # Border Table
    elements.append(Spacer(1, 1*inch))
    elements.append(Paragraph("CERTIFICATE OF PARTICIPATION", ParagraphStyle('Cert', parent=styles['Heading1'], alignment=1, fontSize=30, textColor=colors.HexColor("#6C3CE1"))))
    elements.append(Spacer(1, 0.5*inch))
    
    elements.append(Paragraph("This is to certify that", ParagraphStyle('Normal', alignment=1, fontSize=14)))
    elements.append(Spacer(1, 0.2*inch))
    
    elements.append(Paragraph(registration.user.name, ParagraphStyle('Name', alignment=1, fontSize=24, fontName='Helvetica-Bold')))
    elements.append(Spacer(1, 0.2*inch))
    
    elements.append(Paragraph(f"has successfully attended", ParagraphStyle('Normal', alignment=1, fontSize=14)))
    elements.append(Spacer(1, 0.1*inch))
    
    elements.append(Paragraph(registration.event.title, ParagraphStyle('Event', alignment=1, fontSize=18, fontName='Helvetica-Bold')))
    elements.append(Spacer(1, 0.1*inch))
    
    elements.append(Paragraph(f"held at {registration.event.venue} from {registration.event.start_date} to {registration.event.end_date}.", ParagraphStyle('Normal', alignment=1, fontSize=14)))
    
    elements.append(Spacer(1, 1*inch))
    
    # Signatures placeholder
    sig_data = [["____________________", "____________________"], ["Event Organizer", "Coordinator"]]
    sig_table = Table(sig_data, colWidths=[3*inch, 3*inch])
    sig_table.setStyle(TableStyle([('ALIGN', (0,0), (-1,-1), 'CENTER')]))
    elements.append(sig_table)
    
    doc.build(elements)
    buffer.seek(0)
    return buffer
