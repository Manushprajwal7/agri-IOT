import os
import shutil
import pptx
from pptx.util import Inches, Pt
from pptx.enum.shapes import MSO_SHAPE
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from PIL import Image

def generate_deck():
    prs = pptx.Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    FONT_NAME = "Segoe UI"
    
    # Modern Clean White & Emerald Green Color Palette
    COLOR_WHITE = RGBColor(255, 255, 255)
    COLOR_BG_CARD = RGBColor(255, 255, 255)
    COLOR_CARD_MINT = RGBColor(240, 253, 244)       # Emerald-50 (#F0FDF4)
    COLOR_CARD_SUBTLE = RGBColor(248, 250, 252)     # Slate-50 (#F8FAFC)
    
    COLOR_BORDER_LIGHT = RGBColor(226, 232, 240)    # Slate-200 (#E2E8F0)
    COLOR_BORDER_GREEN = RGBColor(167, 243, 208)    # Emerald-200 (#A7F3D0)
    COLOR_BORDER_DARK_GREEN = RGBColor(110, 231, 183)
    
    COLOR_PRIMARY_DARK = RGBColor(6, 78, 59)        # Emerald-900 (#064E3B)
    COLOR_PRIMARY = RGBColor(4, 120, 87)            # Emerald-700 (#047857)
    COLOR_ACCENT = RGBColor(16, 185, 129)           # Emerald-500 (#10B981)
    
    COLOR_TEXT_MAIN = RGBColor(15, 23, 42)          # Slate-900 (#0F172A)
    COLOR_TEXT_MUTED = RGBColor(71, 85, 105)        # Slate-600 (#475569)
    COLOR_TEXT_SOFT = RGBColor(100, 116, 139)       # Slate-500 (#64748B)
    
    COLOR_ALERT_RED = RGBColor(220, 38, 38)
    COLOR_ALERT_BG = RGBColor(254, 242, 242)
    COLOR_ALERT_BORDER = RGBColor(254, 202, 202)

    # Asset paths
    base_dir = os.path.abspath(os.path.dirname(__file__))
    img_esp32 = os.path.join(base_dir, "assets", "images", "WhatsApp Image 2026-09-25 at 12.04.13 PM.jpeg")
    img_bench = os.path.join(base_dir, "assets", "images", "WhatsApp Image 2026-09-25 at 12.04.14 PM (1).jpeg")
    img_rover_side = os.path.join(base_dir, "assets", "images", "WhatsApp Image 2026-09-25 at 12.04.14 PM.jpeg")
    img_rover_front = os.path.join(base_dir, "assets", "images", "WhatsApp Image 2026-09-25 at 12.04.15 PM.jpeg")
    img_sat = os.path.join(base_dir, "assets", "satellite", "results", "result_img_5.png")
    if not os.path.exists(img_sat):
        img_sat = os.path.join(base_dir, "assets", "satellite", "results", "result_img_1.png")

    def create_base_slide(slide_index, total=12):
        slide = prs.slides.add_slide(blank_layout)
        
        # Pure White Canvas
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
        bg.fill.solid()
        bg.fill.fore_color.rgb = COLOR_WHITE
        bg.line.fill.background()

        # Top Accent Header Bar
        top_accent = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(0.06))
        top_accent.fill.solid()
        top_accent.fill.fore_color.rgb = COLOR_ACCENT
        top_accent.line.fill.background()

        # Footer divider line
        f_div = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), Inches(7.08), Inches(11.733), Inches(0.015))
        f_div.fill.solid()
        f_div.fill.fore_color.rgb = COLOR_BORDER_LIGHT
        f_div.line.fill.background()

        # Footer Left Label
        tb_fl = slide.shapes.add_textbox(Inches(0.8), Inches(7.12), Inches(8.5), Inches(0.28))
        tf_fl = tb_fl.text_frame
        tf_fl.margin_left = tf_fl.margin_top = tf_fl.margin_right = tf_fl.margin_bottom = 0
        p_fl = tf_fl.paragraphs[0]
        p_fl.text = "AgriSense & AgriMarket AI  •  Precision Agriculture, Satellite Analytics & Agentic Supply Chain"
        p_fl.font.name = FONT_NAME
        p_fl.font.size = Pt(8.5)
        p_fl.font.color.rgb = COLOR_TEXT_MUTED

        # Footer Right Slide Index Badge
        tb_fr = slide.shapes.add_textbox(Inches(10.5), Inches(7.12), Inches(2.033), Inches(0.28))
        tf_fr = tb_fr.text_frame
        tf_fr.margin_left = tf_fr.margin_top = tf_fr.margin_right = tf_fr.margin_bottom = 0
        p_fr = tf_fr.paragraphs[0]
        p_fr.text = f"{slide_index:02d} / {total:02d}"
        p_fr.font.name = FONT_NAME
        p_fr.font.bold = True
        p_fr.font.size = Pt(9)
        p_fr.font.color.rgb = COLOR_PRIMARY
        p_fr.alignment = PP_ALIGN.RIGHT

        return slide

    def add_header(slide, tag_text, title_text, subtitle_text):
        # Category Tag Pill
        pill = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(0.30), Inches(2.6), Inches(0.28))
        pill.adjustments[0] = 0.5
        pill.fill.solid()
        pill.fill.fore_color.rgb = COLOR_CARD_MINT
        pill.line.color.rgb = COLOR_BORDER_GREEN
        pill.line.width = Pt(1)
        tf_pill = pill.text_frame
        tf_pill.margin_left = tf_pill.margin_top = tf_pill.margin_right = tf_pill.margin_bottom = 0
        p_pill = tf_pill.paragraphs[0]
        p_pill.text = tag_text.upper()
        p_pill.font.name = FONT_NAME
        p_pill.font.bold = True
        p_pill.font.size = Pt(8.5)
        p_pill.font.color.rgb = COLOR_PRIMARY
        p_pill.alignment = PP_ALIGN.CENTER

        # Title
        tb_t = slide.shapes.add_textbox(Inches(0.8), Inches(0.64), Inches(11.733), Inches(0.45))
        tf_t = tb_t.text_frame
        tf_t.word_wrap = True
        tf_t.margin_left = tf_t.margin_top = tf_t.margin_right = tf_t.margin_bottom = 0
        p_t = tf_t.paragraphs[0]
        p_t.text = title_text
        p_t.font.name = FONT_NAME
        p_t.font.bold = True
        p_t.font.size = Pt(20)
        p_t.font.color.rgb = COLOR_PRIMARY_DARK

        # Subtitle
        tb_s = slide.shapes.add_textbox(Inches(0.8), Inches(1.12), Inches(11.733), Inches(0.32))
        tf_s = tb_s.text_frame
        tf_s.word_wrap = True
        tf_s.margin_left = tf_s.margin_top = tf_s.margin_right = tf_s.margin_bottom = 0
        p_s = tf_s.paragraphs[0]
        p_s.text = subtitle_text
        p_s.font.name = FONT_NAME
        p_s.font.size = Pt(11)
        p_s.font.color.rgb = COLOR_TEXT_MUTED

    def add_modern_card(slide, left, top, width, height, bg_color=COLOR_WHITE, border_color=COLOR_BORDER_LIGHT, border_width=1.0):
        card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
        card.adjustments[0] = 0.035
        card.fill.solid()
        card.fill.fore_color.rgb = bg_color
        card.line.color.rgb = border_color
        card.line.width = Pt(border_width)
        return card

    def add_card_chip(slide, left, top, width, height, text, bg_color=COLOR_CARD_MINT, border_color=COLOR_BORDER_GREEN, text_color=COLOR_PRIMARY, font_size=9.0):
        chip = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
        chip.adjustments[0] = 0.35
        chip.fill.solid()
        chip.fill.fore_color.rgb = bg_color
        chip.line.color.rgb = border_color
        chip.line.width = Pt(1)
        tf = chip.text_frame
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
        p = tf.paragraphs[0]
        p.text = text
        p.font.name = FONT_NAME
        p.font.bold = True
        p.font.size = Pt(font_size)
        p.font.color.rgb = text_color
        p.alignment = PP_ALIGN.CENTER
        return chip

    def place_image_aspect(slide, path, left, top, max_w, max_h):
        if not os.path.exists(path):
            return None
        try:
            im = Image.open(path)
            w, h = im.size
            aspect = w / h
            tw = max_w
            th = tw / aspect
            if th > max_h:
                th = max_h
                tw = th * aspect
            ox = left + (max_w - tw) / 2
            oy = top + (max_h - th) / 2
            return slide.shapes.add_picture(path, ox, oy, tw, th)
        except Exception as e:
            print("Image error:", e)
            return None

    # =========================================================================
    # SLIDE 1: Title Hero Keynote Cover (Modern High-Impact Dashboard)
    # =========================================================================
    s1 = create_base_slide(1)

    # Hero Background Container
    hero_card = add_modern_card(s1, Inches(0.8), Inches(0.85), Inches(11.733), Inches(5.95), COLOR_CARD_MINT, COLOR_BORDER_GREEN, 1.5)

    # Hero Badge
    b1 = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.3), Inches(1.15), Inches(3.6), Inches(0.32))
    b1.adjustments[0] = 0.5
    b1.fill.solid()
    b1.fill.fore_color.rgb = COLOR_WHITE
    b1.line.color.rgb = COLOR_ACCENT
    b1.line.width = Pt(1)
    tf_b1 = b1.text_frame
    tf_b1.margin_left = tf_b1.margin_top = tf_b1.margin_right = tf_b1.margin_bottom = 0
    p_b1 = tf_b1.paragraphs[0]
    p_b1.text = "DSU HACKATHON 2026 • TECHNICAL PRESENTATION"
    p_b1.font.name = FONT_NAME
    p_b1.font.bold = True
    p_b1.font.size = Pt(8.5)
    p_b1.font.color.rgb = COLOR_PRIMARY
    p_b1.alignment = PP_ALIGN.CENTER

    # Main Hero Title
    tb_ht = s1.shapes.add_textbox(Inches(1.3), Inches(1.56), Inches(10.7), Inches(1.35))
    tf_ht = tb_ht.text_frame
    tf_ht.word_wrap = True
    tf_ht.margin_left = tf_ht.margin_top = tf_ht.margin_right = tf_ht.margin_bottom = 0

    p_m1 = tf_ht.paragraphs[0]
    p_m1.text = "AgriSense & AgriMarket AI"
    p_m1.font.name = FONT_NAME
    p_m1.font.bold = True
    p_m1.font.size = Pt(36)
    p_m1.font.color.rgb = COLOR_PRIMARY_DARK

    p_m2 = tf_ht.add_paragraph()
    p_m2.text = "Connected Precision Agriculture, Satellite Crop Intelligence & Voice Agentic Supply Chain"
    p_m2.font.name = FONT_NAME
    p_m2.font.size = Pt(15.5)
    p_m2.font.color.rgb = COLOR_PRIMARY
    p_m2.space_before = Pt(4)

    # 3 Pillars Visual Row across Title
    pill_w = Inches(3.44)
    pill_gap = Inches(0.26)
    pill_x = Inches(1.3)
    pill_h = Inches(2.7)

    hero_pillars = [
        ("GROUND SENSING & ROVER", [
            ("ESP32 Station", "240MHz node with ILI9341 2.8\" SPI TFT LCD."),
            ("Autonomous Rover", "2WD differential chassis with furrow tracking."),
            ("Waterlog Alarm", "Continuous tone triggered strictly >85% moisture.")
        ], "⚡ Live Hardware Prototype Built"),
        ("ORBITAL SATELLITE AI", [
            ("12.4 Ha Coverage", "Sentinel-2 & SpaceNet multispectral ingestion."),
            ("NDVI Vegetation Index", "Chlorophyll absorption & vigor segmentation."),
            ("MobileNetV2 CNN", "Foliar blight detection & 6-stage phenology.")
        ], "🛰️ Macro Aerial Analytics Engine"),
        ("CALL-E VOICE COMMERCE", [
            ("Zero Typing Barrier", "Natural spoken calls in regional languages."),
            ("Mandi Discovery", "Real-time APMC price & warehouse inventory."),
            ("Instant Order Booking", "One-call confirmation & 5-stage logistics.")
        ], "📞 100% Rural Digital Inclusion")
    ]

    for i, (title, bullets, chip_text) in enumerate(hero_pillars):
        px = pill_x + i * (pill_w + pill_gap)
        c_p = add_modern_card(s1, px, Inches(3.05), pill_w, pill_h, COLOR_WHITE, COLOR_BORDER_GREEN, 1.2)

        tb_pt = s1.shapes.add_textbox(px + Inches(0.2), Inches(3.2), pill_w - Inches(0.4), Inches(0.45))
        tf_pt = tb_pt.text_frame
        tf_pt.margin_left = tf_pt.margin_top = tf_pt.margin_right = tf_pt.margin_bottom = 0
        p = tf_pt.paragraphs[0]
        p.text = f"PILLAR 0{i+1}"
        p.font.name = FONT_NAME
        p.font.bold = True
        p.font.size = Pt(8.5)
        p.font.color.rgb = COLOR_ACCENT

        p_t = tf_pt.add_paragraph()
        p_t.text = title
        p_t.font.name = FONT_NAME
        p_t.font.bold = True
        p_t.font.size = Pt(11.5)
        p_t.font.color.rgb = COLOR_PRIMARY_DARK
        p_t.space_before = Pt(2)

        tb_pd = s1.shapes.add_textbox(px + Inches(0.2), Inches(3.85), pill_w - Inches(0.4), Inches(1.35))
        tf_pd = tb_pd.text_frame
        tf_pd.word_wrap = True
        tf_pd.margin_left = tf_pd.margin_top = tf_pd.margin_right = tf_pd.margin_bottom = 0

        for b_lead, b_body in bullets:
            bp = tf_pd.add_paragraph() if tf_pd.paragraphs[0].text else tf_pd.paragraphs[0]
            bp.text = "• " + b_lead + ": "
            bp.font.name = FONT_NAME
            bp.font.bold = True
            bp.font.size = Pt(9.5)
            bp.font.color.rgb = COLOR_TEXT_MAIN
            bp.space_before = Pt(3)
            r = bp.add_run()
            r.text = b_body
            r.font.bold = False
            r.font.color.rgb = COLOR_TEXT_MUTED

        # Bottom anchor chip
        add_card_chip(s1, px + Inches(0.18), Inches(5.3), pill_w - Inches(0.36), Inches(0.32), chip_text, COLOR_CARD_MINT, COLOR_BORDER_GREEN, COLOR_PRIMARY, 8.5)

    # Bottom Metadata Bar in Title Card
    bot_pill = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.3), Inches(6.0), Inches(10.733), Inches(0.42))
    bot_pill.adjustments[0] = 0.5
    bot_pill.fill.solid()
    bot_pill.fill.fore_color.rgb = COLOR_WHITE
    bot_pill.line.color.rgb = COLOR_BORDER_GREEN
    bot_pill.line.width = Pt(1)
    tf_meta = bot_pill.text_frame
    tf_meta.margin_left = tf_meta.margin_top = tf_meta.margin_right = tf_meta.margin_bottom = 0
    p_meta = tf_meta.paragraphs[0]
    p_meta.text = "HARDWARE TESTBED: ESP32-WROOM-32 • 2.8\" SPI TFT LCD • 2WD ROBOTIC TRACTOR • CALL-E VOICE WEBHOOK"
    p_meta.font.name = FONT_NAME
    p_meta.font.bold = True
    p_meta.font.size = Pt(9)
    p_meta.font.color.rgb = COLOR_PRIMARY
    p_meta.alignment = PP_ALIGN.CENTER

    # =========================================================================
    # SLIDE 2: The Dual Crisis (Balanced Cards + Visual Metric Footers)
    # =========================================================================
    s2 = create_base_slide(2)
    add_header(s2, "The Dual Crisis", "Critical Bottlenecks in Agriculture & Rural Supply Chains", "Smallholder farmers face unpredictable agronomic risks on the field and exploitative intermediaries in commerce.")

    col_w = Inches(5.65)
    card_h = Inches(3.6)

    # Left Column: Farming Crisis Card
    c_p1 = add_modern_card(s2, Inches(0.8), Inches(1.55), col_w, card_h, COLOR_WHITE, COLOR_BORDER_LIGHT)

    wh1 = s2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.55), col_w, Inches(0.50))
    wh1.adjustments[0] = 0.05
    wh1.fill.solid()
    wh1.fill.fore_color.rgb = COLOR_ALERT_BG
    wh1.line.color.rgb = COLOR_ALERT_BORDER
    tf_wh1 = wh1.text_frame
    p_wh1 = tf_wh1.paragraphs[0]
    p_wh1.text = "⚠️   ON-FIELD AGRICULTURAL CRISIS"
    p_wh1.font.name = FONT_NAME
    p_wh1.font.bold = True
    p_wh1.font.size = Pt(11)
    p_wh1.font.color.rgb = COLOR_ALERT_RED
    p_wh1.alignment = PP_ALIGN.CENTER

    tb_p1 = s2.shapes.add_textbox(Inches(1.05), Inches(2.18), col_w - Inches(0.5), Inches(2.35))
    tf_p1 = tb_p1.text_frame
    tf_p1.word_wrap = True
    tf_p1.margin_left = tf_p1.margin_top = tf_p1.margin_right = tf_p1.margin_bottom = 0

    ag_issues = [
        ("Blind Irrigation & Water Waste: ", "Guesswork causes over-watering (>85% moisture suffocates roots & causes fungal rot) or drought stress."),
        ("Microclimate Blindspots: ", "Farmers lack real-time soil/ambient telemetry; sudden temperature spikes and humidity surges ruin crops."),
        ("Spatial vs. Temporal Dilemma: ", "Fixed probes only monitor 1 point; manual field walking across hectares is slow, exhausting, and costly."),
        ("Delayed Foliar Blight Detection: ", "Pathogens spread across acres before visible symptoms appear to the naked eye.")
    ]
    for title, desc in ag_issues:
        p = tf_p1.add_paragraph() if tf_p1.paragraphs[0].text else tf_p1.paragraphs[0]
        p.text = "• " + title
        p.font.name = FONT_NAME
        p.font.bold = True
        p.font.size = Pt(9.5)
        p.font.color.rgb = COLOR_TEXT_MAIN
        p.space_before = Pt(4)
        run = p.add_run()
        run.text = desc
        run.font.bold = False
        run.font.color.rgb = COLOR_TEXT_MUTED

    # Bottom Alert Chip on Card 1
    add_card_chip(s2, Inches(1.05), Inches(4.68), col_w - Inches(0.5), Inches(0.36), "⚠️ Consequence: 35%+ water wasted & unnoticed foliar disease destroys yield", COLOR_ALERT_BG, COLOR_ALERT_BORDER, COLOR_ALERT_RED, 8.5)

    # Right Column: Supply Chain Crisis Card
    c_p2 = add_modern_card(s2, Inches(6.85), Inches(1.55), col_w, card_h, COLOR_WHITE, COLOR_BORDER_LIGHT)

    wh2 = s2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.85), Inches(1.55), col_w, Inches(0.50))
    wh2.adjustments[0] = 0.05
    wh2.fill.solid()
    wh2.fill.fore_color.rgb = COLOR_ALERT_BG
    wh2.line.color.rgb = COLOR_ALERT_BORDER
    tf_wh2 = wh2.text_frame
    p_wh2 = tf_wh2.paragraphs[0]
    p_wh2.text = "⚠️   RURAL SUPPLY CHAIN INEFFICIENCIES"
    p_wh2.font.name = FONT_NAME
    p_wh2.font.bold = True
    p_wh2.font.size = Pt(11)
    p_wh2.font.color.rgb = COLOR_ALERT_RED
    p_wh2.alignment = PP_ALIGN.CENTER

    tb_p2 = s2.shapes.add_textbox(Inches(7.1), Inches(2.18), col_w - Inches(0.5), Inches(2.35))
    tf_p2 = tb_p2.text_frame
    tf_p2.word_wrap = True
    tf_p2.margin_left = tf_p2.margin_top = tf_p2.margin_right = tf_p2.margin_bottom = 0

    sc_issues = [
        ("Predatory Middlemen Exploitation: ", "Commission agents capture 40%–60% of crop value while charging heavy markups on fertilizers & seeds."),
        ("Opaque Pricing & Input Scarcity: ", "Farmers have no real-time way to know if authentic seeds or tractors are available nearby at fair mandi rates."),
        ("High Procurement Latency: ", "Arranging equipment rentals takes days of phone calls, missing critical monsoon sowing and harvesting windows."),
        ("The App Accessibility Barrier: ", "Standard mobile apps fail because smallholder farmers cannot type, navigate complex carts, or read English portals.")
    ]
    for title, desc in sc_issues:
        p = tf_p2.add_paragraph() if tf_p2.paragraphs[0].text else tf_p2.paragraphs[0]
        p.text = "• " + title
        p.font.name = FONT_NAME
        p.font.bold = True
        p.font.size = Pt(9.5)
        p.font.color.rgb = COLOR_TEXT_MAIN
        p.space_before = Pt(4)
        run = p.add_run()
        run.text = desc
        run.font.bold = False
        run.font.color.rgb = COLOR_TEXT_MUTED

    # Bottom Alert Chip on Card 2
    add_card_chip(s2, Inches(7.1), Inches(4.68), col_w - Inches(0.5), Inches(0.36), "⚠️ Consequence: 40%–60% crop margin siphoned by cartels; 85% abandon apps", COLOR_ALERT_BG, COLOR_ALERT_BORDER, COLOR_ALERT_RED, 8.5)

    # Bottom Root Cause Banner
    bot_b = add_modern_card(s2, Inches(0.8), Inches(5.35), Inches(11.733), Inches(1.45), COLOR_CARD_MINT, COLOR_BORDER_GREEN, 1.2)
    tb_bb = s2.shapes.add_textbox(Inches(1.05), Inches(5.45), Inches(11.233), Inches(1.25))
    tf_bb = tb_bb.text_frame
    tf_bb.word_wrap = True
    tf_bb.margin_left = tf_bb.margin_top = tf_bb.margin_right = tf_bb.margin_bottom = 0

    p = tf_bb.paragraphs[0]
    p.text = "THE ROOT CAUSE: THE DISCONNECT BETWEEN SOIL REALITY & MARKET GATE"
    p.font.name = FONT_NAME
    p.font.bold = True
    p.font.size = Pt(11)
    p.font.color.rgb = COLOR_PRIMARY_DARK

    p_sub = tf_bb.add_paragraph()
    p_sub.text = "Precision agriculture tools have traditionally been expensive, siloed, and app-based. When on-field soil decisions are unguided by real data, farmers suffer crop losses. When procurement is controlled by predatory cartels, farmers lose their margins. AgriSense solves both ends simultaneously."
    p_sub.font.name = FONT_NAME
    p_sub.font.size = Pt(10)
    p_sub.font.color.rgb = COLOR_TEXT_MUTED
    p_sub.space_before = Pt(4)
    p_sub.line_spacing = 1.3

    # =========================================================================
    # SLIDE 3: The Unified 3-Pillar Solution Architecture + Closed-Loop Flow
    # =========================================================================
    s3 = create_base_slide(3)
    add_header(s3, "Architecture", "The AgriSense & AgriMarket 3-Pillar Ecosystem", "A closed-loop cyber-physical platform linking ground sensing, aerial satellite analytics, and voice AI commerce.")

    col3_w = Inches(3.65)
    gap3 = Inches(0.4)
    x3 = Inches(0.8)
    card3_h = Inches(3.6)

    pillars_detail = [
        {
            "tag": "PILLAR 1",
            "title": "Ground IoT & Field Rover",
            "items": [
                "ESP32 dual-core 240MHz microcontroller",
                "2.8\" SPI TFT LCD live farm telemetry GUI",
                "Dielectric soil moisture & DHT climate sensor",
                "Waterlogging alarm: sounds only above 85%",
                "Autonomous 2WD field rover / robotic tractor",
                "IR furrow tracking & collision stop sensors"
            ],
            "chip": "⚡ 2000ms JSON Telemetry & Furrow Control"
        },
        {
            "tag": "PILLAR 2",
            "title": "Satellite Crop Intelligence",
            "items": [
                "12.4 Hectare orbital agricultural parcel view",
                "Multi-spectral NDVI vegetation index calculation",
                "Chlorophyll density & drought risk zoning",
                "MobileNetV2 CNN foliar disease segmentation",
                "6-stage crop phenology timeline tracking",
                "Automated harvest & fertilizer recommendations"
            ],
            "chip": "🛰️ High-Vigor (>0.7) vs Stressed (<0.4) Zoning"
        },
        {
            "tag": "PILLAR 3",
            "title": "Call-E Voice Agentic AI",
            "items": [
                "Automated phone call dialed directly to farmer",
                "Natural spoken dialogue in regional languages",
                "Live catalog inventory & APMC price check",
                "Instant voice order confirmation & booking ID",
                "Peer-to-peer farmer-to-farmer AgriMarket",
                "5-stage real-time supply chain tracking stepper"
            ],
            "chip": "📞 Instant Booking Lock & SMS Confirmation"
        }
    ]

    for i, p_info in enumerate(pillars_detail):
        cx = x3 + i * (col3_w + gap3)
        c = add_modern_card(s3, cx, Inches(1.55), col3_w, card3_h, COLOR_WHITE, COLOR_BORDER_LIGHT)

        # Header box
        hb = s3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, cx, Inches(1.55), col3_w, Inches(0.85))
        hb.adjustments[0] = 0.05
        hb.fill.solid()
        hb.fill.fore_color.rgb = COLOR_CARD_MINT
        hb.line.color.rgb = COLOR_BORDER_GREEN
        tf_hb = hb.text_frame
        tf_hb.margin_left = tf_hb.margin_top = tf_hb.margin_right = tf_hb.margin_bottom = 0

        p1 = tf_hb.paragraphs[0]
        p1.text = p_info["tag"]
        p1.font.name = FONT_NAME
        p1.font.bold = True
        p1.font.size = Pt(8.5)
        p1.font.color.rgb = COLOR_PRIMARY
        p1.alignment = PP_ALIGN.CENTER

        p2 = tf_hb.add_paragraph()
        p2.text = p_info["title"]
        p2.font.name = FONT_NAME
        p2.font.bold = True
        p2.font.size = Pt(11.5)
        p2.font.color.rgb = COLOR_PRIMARY_DARK
        p2.alignment = PP_ALIGN.CENTER
        p2.space_before = Pt(2)

        tb_bb = s3.shapes.add_textbox(cx + Inches(0.2), Inches(2.48), col3_w - Inches(0.4), Inches(2.1))
        tf_bb = tb_bb.text_frame
        tf_bb.word_wrap = True
        tf_bb.margin_left = tf_bb.margin_top = tf_bb.margin_right = tf_bb.margin_bottom = 0

        for it in p_info["items"]:
            bp = tf_bb.add_paragraph() if tf_bb.paragraphs[0].text else tf_bb.paragraphs[0]
            bp.text = "✔  " + it
            bp.font.name = FONT_NAME
            bp.font.size = Pt(9.5)
            bp.font.color.rgb = COLOR_TEXT_MAIN
            bp.space_before = Pt(3.5)

        # Bottom anchor chip
        add_card_chip(s3, cx + Inches(0.18), Inches(4.68), col3_w - Inches(0.36), Inches(0.36), p_info["chip"], COLOR_CARD_MINT, COLOR_BORDER_GREEN, COLOR_PRIMARY, 8.5)

    # Bottom Closed-Loop Pipeline Banner
    flow_card = add_modern_card(s3, Inches(0.8), Inches(5.35), Inches(11.733), Inches(1.45), COLOR_CARD_MINT, COLOR_BORDER_GREEN, 1.2)
    tb_fc = s3.shapes.add_textbox(Inches(1.05), Inches(5.45), Inches(11.233), Inches(1.25))
    tf_fc = tb_fc.text_frame
    tf_fc.word_wrap = True
    tf_fc.margin_left = tf_fc.margin_top = tf_fc.margin_right = tf_fc.margin_bottom = 0

    p = tf_fc.paragraphs[0]
    p.text = "CLOSED-LOOP FEEDBACK: FROM PHYSICAL SOIL TO AUTOMATED DELIVERY"
    p.font.name = FONT_NAME
    p.font.bold = True
    p.font.size = Pt(11)
    p.font.color.rgb = COLOR_PRIMARY_DARK

    p_flow = tf_fc.add_paragraph()
    p_flow.text = "[ 1. Ground Sensing (ESP32) ] ➔ [ 2. Rover Spot Validation ] ➔ [ 3. Satellite Macro NDVI ] ➔ [ 4. Call-E Voice AI Enquiry ] ➔ [ 5. 5-Stage Logistics Delivery ]"
    p_flow.font.name = FONT_NAME
    p_flow.font.bold = True
    p_flow.font.size = Pt(10.5)
    p_flow.font.color.rgb = COLOR_PRIMARY
    p_flow.space_before = Pt(5)

    p_flow_sub = tf_fc.add_paragraph()
    p_flow_sub.text = "Telemetry doesn't just display on a screen — when soil is waterlogged or satellite flags nutrient deficiency, Call-E proactively calls the farmer with exact solutions and delivers them directly to the farm gate."
    p_flow_sub.font.name = FONT_NAME
    p_flow_sub.font.size = Pt(9.5)
    p_flow_sub.font.color.rgb = COLOR_TEXT_MUTED
    p_flow_sub.space_before = Pt(3)

    # =========================================================================
    # SLIDE 4: ESP32 IoT Node & SPI Color TFT Dashboard
    # =========================================================================
    s4 = create_base_slide(4)
    add_header(s4, "IoT Hardware Node", "ESP32 Sensor Station & Real-Time Color SPI TFT Display", "On-field microclimate telemetry station providing continuous root-zone logging and local display.")

    card_img = add_modern_card(s4, Inches(0.8), Inches(1.55), Inches(3.8), Inches(5.25), COLOR_CARD_SUBTLE, COLOR_BORDER_LIGHT)
    place_image_aspect(s4, img_esp32, Inches(1.0), Inches(1.70), Inches(3.4), Inches(4.35))

    cap_pill = s4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.0), Inches(6.20), Inches(3.4), Inches(0.45))
    cap_pill.adjustments[0] = 0.5
    cap_pill.fill.solid()
    cap_pill.fill.fore_color.rgb = COLOR_CARD_MINT
    cap_pill.line.color.rgb = COLOR_BORDER_GREEN
    tf_cp = cap_pill.text_frame
    p_cp = tf_cp.paragraphs[0]
    p_cp.text = "● LIVE: 48% Soil • 27.0°C • 67% RH on ILI9341 LCD"
    p_cp.font.name = FONT_NAME
    p_cp.font.bold = True
    p_cp.font.size = Pt(9)
    p_cp.font.color.rgb = COLOR_PRIMARY
    p_cp.alignment = PP_ALIGN.CENTER

    grid_w = Inches(3.7)
    grid_h = Inches(2.5)
    gx1 = Inches(4.9)
    gx2 = Inches(8.833)
    gy1 = Inches(1.55)
    gy2 = Inches(4.3)

    specs_cards = [
        (gx1, gy1, "1. COMPUTE & SPI DISPLAY", [
            ("ESP32 Dual-Core", "32-bit Xtensa LX6 microcontroller @ 240MHz."),
            ("2.8\" SPI Color TFT", "320x240 ILI9341 controller with 40MHz bus."),
            ("Firmware Engine", "Runs embedded AgriSense Farm OS v2.4."),
            ("Dashboard GUI", "Live plot ID, moisture %, temp, & buzzer state.")
        ], "⚙️ 240MHz Dual-Core • 40MHz SPI • FreeRTOS"),
        (gx2, gy1, "2. ROOT-ZONE SOIL SENSING", [
            ("Dielectric Soil Probe", "Corrosion-resistant capacitive PCB probe on ADC1."),
            ("12-Bit Analog Precision", "0–4095 range mapped to volumetric moisture %."),
            ("Soil Curve Calibration", "Optimized calibration curve for red & clay loams."),
            ("Digital Filtering", "Zero-drift rolling average rejects analog noise.")
        ], "🌱 12-Bit ADC0 (0–4095) • Anti-Corrosion Probe"),
        (gx1, gy2, "3. CANOPY MICROCLIMATE", [
            ("Digital Climate Sensor", "DHT11 / DHT22 environmental sensor on GPIO 15."),
            ("Ambient Monitoring", "Calibrated temperature (±0.5°C) & humidity (±2%)."),
            ("Vapor Pressure Deficit", "VPD algorithmic tracking predicts transpiration stress."),
            ("Frost & Heat Risk", "Automatic alerts sent before frost or heat blights occur.")
        ], "🌡️ ±0.5°C Temp • ±2% RH • Real-Time VPD"),
        (gx2, gy2, "4. WATERLOGGING DEFENSE ALARM", [
            ("Active Piezo Buzzer", "Tone generator driven via high-speed GPIO 5."),
            ("Normal Moisture Silent", "Zero false alarms during healthy moisture (27%–84%)."),
            ("Continuous Short Tone", "Continuous rapid pulsing ONLY when moisture >85%."),
            ("Root Rot Protection", "Prevents asphyxiation, fungus, and stuck solenoid valves.")
        ], "🚨 Active Piezo Tone • Continuous Pulsed >85%")
    ]

    for gx, gy, title, points, chip_text in specs_cards:
        sc = add_modern_card(s4, gx, gy, grid_w, grid_h, COLOR_WHITE, COLOR_BORDER_LIGHT)

        tb = s4.shapes.add_textbox(gx + Inches(0.2), gy + Inches(0.15), grid_w - Inches(0.4), Inches(1.8))
        tf = tb.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0

        p = tf.paragraphs[0]
        p.text = title
        p.font.name = FONT_NAME
        p.font.bold = True
        p.font.size = Pt(10.5)
        p.font.color.rgb = COLOR_PRIMARY_DARK

        for b_lead, b_body in points:
            bp = tf.add_paragraph()
            bp.text = "• " + b_lead + ": "
            bp.font.name = FONT_NAME
            bp.font.bold = True
            bp.font.size = Pt(9)
            bp.font.color.rgb = COLOR_TEXT_MAIN
            bp.space_before = Pt(3)
            r = bp.add_run()
            r.text = b_body
            r.font.bold = False
            r.font.color.rgb = COLOR_TEXT_MUTED

        # Bottom spec chip
        add_card_chip(s4, gx + Inches(0.18), gy + Inches(2.05), grid_w - Inches(0.36), Inches(0.34), chip_text, COLOR_CARD_MINT, COLOR_BORDER_GREEN, COLOR_PRIMARY, 8.0)

    # =========================================================================
    # SLIDE 5: Autonomous Field Rover (Mobile Robotic Tractor)
    # =========================================================================
    s5 = create_base_slide(5)
    add_header(s5, "Robotic Locomotion", "Autonomous Agricultural Field Rover & Row Guidance", "Mobile robotic unit for in-field traversal, furrow tracking, and automated spot soil validation.")

    img_card_w = Inches(5.65)
    img_card_h = Inches(3.0)

    c_img1 = add_modern_card(s5, Inches(0.8), Inches(1.55), img_card_w, img_card_h, COLOR_CARD_SUBTLE, COLOR_BORDER_LIGHT)
    place_image_aspect(s5, img_rover_side, Inches(0.9), Inches(1.65), img_card_w - Inches(0.2), img_card_h - Inches(0.55))
    tb_c1 = s5.shapes.add_textbox(Inches(0.9), Inches(4.15), img_card_w - Inches(0.2), Inches(0.32))
    tf_c1 = tb_c1.text_frame
    p1 = tf_c1.paragraphs[0]
    p1.text = "Fig 3: Dual-deck acrylic chassis, TT gearmotors & H-bridge driver"
    p1.font.name = FONT_NAME
    p1.font.bold = True
    p1.font.size = Pt(9.5)
    p1.font.color.rgb = COLOR_PRIMARY
    p1.alignment = PP_ALIGN.CENTER

    c_img2 = add_modern_card(s5, Inches(6.85), Inches(1.55), img_card_w, img_card_h, COLOR_CARD_SUBTLE, COLOR_BORDER_LIGHT)
    place_image_aspect(s5, img_rover_front, Inches(6.95), Inches(1.65), img_card_w - Inches(0.2), img_card_h - Inches(0.55))
    tb_c2 = s5.shapes.add_textbox(Inches(6.95), Inches(4.15), img_card_w - Inches(0.2), Inches(0.32))
    tf_c2 = tb_c2.text_frame
    p2 = tf_c2.paragraphs[0]
    p2.text = "Fig 4: Front dual TCRT5000 IR furrow sensors & 360° ball caster"
    p2.font.name = FONT_NAME
    p2.font.bold = True
    p2.font.size = Pt(9.5)
    p2.font.color.rgb = COLOR_PRIMARY
    p2.alignment = PP_ALIGN.CENTER

    b3_w = Inches(3.65)
    b3_gap = Inches(0.4)
    b3_x = Inches(0.8)

    rover_bottom = [
        ("LOCOMOTION & CHASSIS", [
            ("Dual-Deck Chassis", "Laser-cut acrylic structure isolates sensor vibration."),
            ("Twin 1:48 Motors", "High-torque geared DC drive train for rough terrain."),
            ("Rubber Tires", "Deep-grooved rubber treads mounted on custom green rims."),
            ("Trench Traversal", "Climbs dirt ridges, mulch beds, and furrow ditches.")
        ], "🚜 Dual TT 1:48 Motors & 65mm Tires"),
        ("H-BRIDGE MOTOR DRIVER", [
            ("L298N Architecture", "Dual full-bridge driver with thermal overload protection."),
            ("PWM Speed Control", "Independent pulse-width modulation for both tracks."),
            ("Differential Steering", "Zero-turn radius skid steering for tight headland turns."),
            ("Emergency Braking", "Active electrical braking on obstacle encounter.")
        ], "⚡ Dual H-Bridge • Bidirectional PWM"),
        ("AUTONOMOUS GUIDANCE", [
            ("Dual TCRT5000 Array", "Infrared reflectance phototransistors trace furrow contrast."),
            ("Row Tracking", "Autonomous navigation along crop beds without human driving."),
            ("Collision Stop", "Proactive shutdown when rocks or drip irrigation pipes detected."),
            ("Omni Front Caster", "360° steel/nylon ball caster for frictionless pivots.")
        ], "🔍 Dual TCRT5000 IR Furrow Sensors")
    ]

    for i, (rtitle, rpoints, chip_text) in enumerate(rover_bottom):
        bx = b3_x + i * (b3_w + b3_gap)
        rc = add_modern_card(s5, bx, Inches(4.65), b3_w, Inches(2.15), COLOR_WHITE, COLOR_BORDER_LIGHT)

        tb = s5.shapes.add_textbox(bx + Inches(0.2), Inches(4.75), b3_w - Inches(0.4), Inches(1.5))
        tf = tb.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0

        p = tf.paragraphs[0]
        p.text = rtitle
        p.font.name = FONT_NAME
        p.font.bold = True
        p.font.size = Pt(10.5)
        p.font.color.rgb = COLOR_PRIMARY_DARK

        for b_lead, b_body in rpoints:
            bp = tf.add_paragraph()
            bp.text = "• " + b_lead + ": "
            bp.font.name = FONT_NAME
            bp.font.bold = True
            bp.font.size = Pt(9)
            bp.font.color.rgb = COLOR_TEXT_MAIN
            bp.space_before = Pt(2.5)
            r = bp.add_run()
            r.text = b_body
            r.font.bold = False
            r.font.color.rgb = COLOR_TEXT_MUTED

        add_card_chip(s5, bx + Inches(0.18), Inches(6.38), b3_w - Inches(0.36), Inches(0.34), chip_text, COLOR_CARD_MINT, COLOR_BORDER_GREEN, COLOR_PRIMARY, 8.0)

    # =========================================================================
    # SLIDE 6: Integrated Physical Testbed & Dual Sensing Synergy
    # =========================================================================
    s6 = create_base_slide(6)
    add_header(s6, "Cyber-Physical Testbed", "Integrated Station: Fixed IoT Node + Mobile Field Rover", "Combining continuous temporal logging at fixed zones with autonomous mobile spatial validation.")

    bench_w = Inches(5.4)
    c_bench = add_modern_card(s6, Inches(0.8), Inches(1.55), bench_w, Inches(5.25), COLOR_CARD_SUBTLE, COLOR_BORDER_LIGHT)
    place_image_aspect(s6, img_bench, Inches(0.95), Inches(1.75), bench_w - Inches(0.3), Inches(4.25))

    tb_bc = s6.shapes.add_textbox(Inches(0.95), Inches(6.20), bench_w - Inches(0.3), Inches(0.4))
    tf_bc = tb_bc.text_frame
    p_bc = tf_bc.paragraphs[0]
    p_bc.text = "Fig 2: Dual cyber-physical testbed operating in laboratory"
    p_bc.font.name = FONT_NAME
    p_bc.font.bold = True
    p_bc.font.size = Pt(9.5)
    p_bc.font.color.rgb = COLOR_PRIMARY
    p_bc.alignment = PP_ALIGN.CENTER

    rw = Inches(6.033)
    rx = Inches(6.5)

    synergy_cards = [
        ("SOLVING THE SPATIAL-TEMPORAL TRADEOFF", [
            ("The Tradeoff", "Fixed probes give 24/7 root curves at 1 plant. Roaming rovers survey wide rows but cannot log continuous daily soil depletion."),
            ("The Hybrid Synergy", "Fixed ESP32 stations act as temporal ground-truth anchors; the autonomous mobile rover validates spatial moisture uniformity across hectares.")
        ], "⚡ Fixed Station (24/7 Depth) + Mobile Rover (Wide Acreage)"),
        ("EDGE-TO-CLOUD TELEMETRY PIPELINE", [
            ("JSON Telemetry", "Structured telemetry dispatched every 2000ms via Wi-Fi/MQTT: {'nodeId': 'PLOT-4B', 'soilMoist': 48, 'tempC': 27, 'alarm': false}."),
            ("Digital Twin UI", "Real-time HTML5 Canvas dashboard mirrors physical ILI9341 display with sub-second WebSocket updates.")
        ], "🌐 2000ms JSON Telemetry Dispatched via MQTT / REST"),
        ("AUTOMATED THRESHOLD & CONTROL LOOP", [
            ("Deficit Automation", "Soil moisture dropping below 30% triggers automated drip irrigation solenoid actuation."),
            ("Waterlogging Protection", "Moisture exceeding 85% sounds physical buzzer & alerts farmer via Call-E voice call to prevent root asphyxiation.")
        ], "🔔 Valve Open <30%  •  Continuous Alarm Sounded ONLY >85%")
    ]

    for j, (stitle, spoints, chip_text) in enumerate(synergy_cards):
        sy = Inches(1.55) + j * Inches(1.78)
        sc = add_modern_card(s6, rx, sy, rw, Inches(1.68), COLOR_WHITE, COLOR_BORDER_LIGHT)

        tb = s6.shapes.add_textbox(rx + Inches(0.2), sy + Inches(0.12), rw - Inches(0.4), Inches(1.15))
        tf = tb.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0

        p = tf.paragraphs[0]
        p.text = stitle
        p.font.name = FONT_NAME
        p.font.bold = True
        p.font.size = Pt(10.5)
        p.font.color.rgb = COLOR_PRIMARY_DARK

        for b_lead, b_body in spoints:
            bp = tf.add_paragraph()
            bp.text = "• " + b_lead + ": "
            bp.font.name = FONT_NAME
            bp.font.bold = True
            bp.font.size = Pt(9)
            bp.font.color.rgb = COLOR_TEXT_MAIN
            bp.space_before = Pt(3)
            r = bp.add_run()
            r.text = b_body
            r.font.bold = False
            r.font.color.rgb = COLOR_TEXT_MUTED

        add_card_chip(s6, rx + Inches(0.18), sy + Inches(1.26), rw - Inches(0.36), Inches(0.32), chip_text, COLOR_CARD_MINT, COLOR_BORDER_GREEN, COLOR_PRIMARY, 8.5)

    # =========================================================================
    # SLIDE 7: Satellite Crop Intelligence & Multi-Spectral NDVI
    # =========================================================================
    s7 = create_base_slide(7)
    add_header(s7, "Macro-Scale Aerial Vision", "Satellite Crop Intelligence & Multi-Spectral NDVI Analytics", "Orbital remote sensing across 12.4+ hectare parcels to detect canopy vigor and foliar stress.")

    sat_w = Inches(5.4)
    c_sat = add_modern_card(s7, Inches(0.8), Inches(1.55), sat_w, Inches(5.25), COLOR_CARD_SUBTLE, COLOR_BORDER_LIGHT)
    place_image_aspect(s7, img_sat, Inches(0.95), Inches(1.75), sat_w - Inches(0.3), Inches(4.25))

    tb_sc = s7.shapes.add_textbox(Inches(0.95), Inches(6.20), sat_w - Inches(0.3), Inches(0.4))
    tf_sc = tb_sc.text_frame
    p_sc = tf_sc.paragraphs[0]
    p_sc.text = "Fig 5: Multi-spectral NDVI vegetation index & MobileNetV2 segmentation"
    p_sc.font.name = FONT_NAME
    p_sc.font.bold = True
    p_sc.font.size = Pt(9.5)
    p_sc.font.color.rgb = COLOR_PRIMARY
    p_sc.alignment = PP_ALIGN.CENTER

    sat_cards = [
        ("12.4 HA ORBITAL PARCEL SURVEILLANCE", [
            ("Multi-Spectral Ingestion", "SpaceNet & Sentinel-2 imagery ingested directly into Python analytics engine."),
            ("10m/px Resolution", "High-resolution red & near-infrared bands provide whole-farm macro visibility."),
            ("Boundary Geofencing", "Automated farm boundary geofencing correlates micro-plots with macro satellite tiles.")
        ], "🛰️ SpaceNet & Sentinel-2 10m/px Multi-Spectral Imagery"),
        ("SPECTRAL NDVI VEGETATION INDEX", [
            ("Algorithmic Metric", "NDVI = (NIR - RED) / (NIR + RED) quantifies active chlorophyll absorption."),
            ("Canopy Health Zoning", "Parcels classified into High Vigor (>0.7), Moderate (0.4–0.7), and Stressed (<0.4)."),
            ("Early Warning", "Detects invisible nitrogen starvation and moisture stress 7–10 days early.")
        ], "📊 (NIR - RED) / (NIR + RED) Chlorophyll Density Mapping"),
        ("MOBILENETV2 CNN & PHENOLOGY TIMELINE", [
            ("Edge Deep Learning", "MobileNetV2 CNN segments foliar fungal blights directly from aerial/camera crops."),
            ("6-Stage Phenology", "Tracks Seeding → Vegetative → Flowering → Fruit Formation → Harvest."),
            ("Actionable Advisory", "Generates targeted fertilizer & spray prescriptions linked to AgriMarket.")
        ], "🧠 MobileNetV2 CNN Foliar Segmentation & Crop Stage Engine")
    ]

    for k, (ktitle, kpoints, chip_text) in enumerate(sat_cards):
        ky = Inches(1.55) + k * Inches(1.78)
        kc = add_modern_card(s7, rx, ky, rw, Inches(1.68), COLOR_WHITE, COLOR_BORDER_LIGHT)

        tb = s7.shapes.add_textbox(rx + Inches(0.2), ky + Inches(0.12), rw - Inches(0.4), Inches(1.15))
        tf = tb.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0

        p = tf.paragraphs[0]
        p.text = ktitle
        p.font.name = FONT_NAME
        p.font.bold = True
        p.font.size = Pt(10.5)
        p.font.color.rgb = COLOR_PRIMARY_DARK

        for b_lead, b_body in kpoints:
            bp = tf.add_paragraph()
            bp.text = "• " + b_lead + ": "
            bp.font.name = FONT_NAME
            bp.font.bold = True
            bp.font.size = Pt(9)
            bp.font.color.rgb = COLOR_TEXT_MAIN
            bp.space_before = Pt(3)
            r = bp.add_run()
            r.text = b_body
            r.font.bold = False
            r.font.color.rgb = COLOR_TEXT_MUTED

        add_card_chip(s7, rx + Inches(0.18), ky + Inches(1.26), rw - Inches(0.36), Inches(0.32), chip_text, COLOR_CARD_MINT, COLOR_BORDER_GREEN, COLOR_PRIMARY, 8.5)

    # =========================================================================
    # SLIDE 8: The Supply Chain Dilemma & Voice-First Solution
    # =========================================================================
    s8 = create_base_slide(8)
    add_header(s8, "Commerce Paradigm", "Why Traditional E-Commerce Fails in Rural Farming", "Overcoming literacy, language, and technology barriers through voice-first agentic interaction.")

    card8_h = Inches(3.6)

    comp_cards = [
        {
            "tag": "TRADITIONAL APPS",
            "tag_color": COLOR_ALERT_RED,
            "title": "Why Mobile Apps Fail",
            "bullets": [
                ("High Friction", "Requires smartphone, 4G data, and app-store account."),
                ("Typing Obstacle", "Smallholders struggle with touch keyboards & Latin text."),
                ("Complex Checkout", "Multi-step carts and payment gateways cause confusion."),
                ("Abandonment", "Over 85% of rural farmers abandon e-commerce apps.")
            ],
            "chip": "🚨 85%+ Farmers Abandon Screen Apps",
            "chip_bg": COLOR_ALERT_BG,
            "chip_border": COLOR_ALERT_BORDER,
            "chip_color": COLOR_ALERT_RED
        },
        {
            "tag": "MIDDLEMAN SYSTEM",
            "tag_color": COLOR_ALERT_RED,
            "title": "Why Agents Exploit",
            "bullets": [
                ("Opaque Margins", "Village commission dalals extract 40%–60% of crop value."),
                ("Input Markups", "Excessive price markups on seeds, bio-NPK & pesticides."),
                ("Counterfeit Risk", "Zero guarantee of certified seed germination or purity."),
                ("Debt Traps", "Delayed crop payouts trap farmers in perpetual credit debt.")
            ],
            "chip": "💸 40%–60% Margins Siphoned by Dalals",
            "chip_bg": COLOR_ALERT_BG,
            "chip_border": COLOR_ALERT_BORDER,
            "chip_color": COLOR_ALERT_RED
        },
        {
            "tag": "CALL-E VOICE AI",
            "tag_color": COLOR_PRIMARY,
            "title": "Voice-First Solution",
            "bullets": [
                ("Zero Friction", "Works on ANY basic keypad or feature phone via phone call."),
                ("Natural Speech", "Farmers talk naturally in native Kannada, Hindi, or English."),
                ("Mandi Transparency", "Direct real-time APMC price quotes & stock checks."),
                ("1-Call Booking", "Books tractors, seeds, and fertilizers in under 60 seconds.")
            ],
            "chip": "✨ 100% Accessible on Any Basic Phone",
            "chip_bg": COLOR_CARD_MINT,
            "chip_border": COLOR_BORDER_GREEN,
            "chip_color": COLOR_PRIMARY
        }
    ]

    for i, cd in enumerate(comp_cards):
        cx = x3 + i * (col3_w + gap3)
        c = add_modern_card(s8, cx, Inches(1.55), col3_w, card8_h, COLOR_WHITE, COLOR_BORDER_LIGHT)

        tb = s8.shapes.add_textbox(cx + Inches(0.25), Inches(1.70), col3_w - Inches(0.5), Inches(2.8))
        tf = tb.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0

        p_tag = tf.paragraphs[0]
        p_tag.text = cd["tag"]
        p_tag.font.name = FONT_NAME
        p_tag.font.bold = True
        p_tag.font.size = Pt(8.5)
        p_tag.font.color.rgb = cd["tag_color"]

        p_t = tf.add_paragraph()
        p_t.text = cd["title"]
        p_t.font.name = FONT_NAME
        p_t.font.bold = True
        p_t.font.size = Pt(12.5)
        p_t.font.color.rgb = COLOR_TEXT_MAIN
        p_t.space_before = Pt(2)
        p_t.space_after = Pt(6)

        for b_lead, b_body in cd["bullets"]:
            bp = tf.add_paragraph()
            bp.text = "• " + b_lead + ": "
            bp.font.name = FONT_NAME
            bp.font.bold = True
            bp.font.size = Pt(9.5)
            bp.font.color.rgb = COLOR_TEXT_MAIN
            bp.space_before = Pt(3.5)
            r = bp.add_run()
            r.text = b_body
            r.font.bold = False
            r.font.color.rgb = COLOR_TEXT_MUTED

        add_card_chip(s8, cx + Inches(0.18), Inches(4.68), col3_w - Inches(0.36), Inches(0.36), cd["chip"], cd["chip_bg"], cd["chip_border"], cd["chip_color"], 8.5)

    # Bottom Voice-First Breakthrough Banner
    bot_b8 = add_modern_card(s8, Inches(0.8), Inches(5.35), Inches(11.733), Inches(1.45), COLOR_CARD_MINT, COLOR_BORDER_GREEN, 1.2)
    tb_b8 = s8.shapes.add_textbox(Inches(1.05), Inches(5.45), Inches(11.233), Inches(1.25))
    tf_b8 = tb_b8.text_frame
    tf_b8.word_wrap = True
    tf_b8.margin_left = tf_b8.margin_top = tf_b8.margin_right = tf_b8.margin_bottom = 0

    p = tf_b8.paragraphs[0]
    p.text = "THE ACCESSIBILITY BREAKTHROUGH: SPEECH INSTEAD OF SCREENS"
    p.font.name = FONT_NAME
    p.font.bold = True
    p.font.size = Pt(11)
    p.font.color.rgb = COLOR_PRIMARY_DARK

    p_sub8 = tf_b8.add_paragraph()
    p_sub8.text = "Over 95% of smallholder farmers own a feature phone or smartphone and know how to answer an incoming voice call. By replacing typed web stores with an autonomous agentic voice system, Call-E eliminates the digital divide, providing instantaneous price transparency and verified input booking to any farmer in India."
    p_sub8.font.name = FONT_NAME
    p_sub8.font.size = Pt(10)
    p_sub8.font.color.rgb = COLOR_TEXT_MUTED
    p_sub8.space_before = Pt(4)
    p_sub8.line_spacing = 1.3

    # =========================================================================
    # SLIDE 9: Call-E Agentic AI — Phone Call Commodity Booking
    # =========================================================================
    s9 = create_base_slide(9)
    add_header(s9, "Voice Agentic Commerce", "Call-E Voice AI: Automated Commodity Enquiry & Booking", "Farmers simply talk on their phone: enquire availability, confirm prices, and instantly book supplies.")

    phone_w = Inches(4.5)
    c_phone = add_modern_card(s9, Inches(0.8), Inches(1.55), phone_w, Inches(5.25), COLOR_CARD_MINT, COLOR_BORDER_GREEN, 1.2)

    # Smartphone Call Header Box
    call_hdr = s9.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.05), Inches(1.75), phone_w - Inches(0.5), Inches(0.65))
    call_hdr.adjustments[0] = 0.15
    call_hdr.fill.solid()
    call_hdr.fill.fore_color.rgb = COLOR_WHITE
    call_hdr.line.color.rgb = COLOR_BORDER_GREEN
    call_hdr.line.width = Pt(1)
    tf_ch = call_hdr.text_frame
    tf_ch.margin_left = tf_ch.margin_top = tf_ch.margin_right = tf_ch.margin_bottom = 0
    p_ch1 = tf_ch.paragraphs[0]
    p_ch1.text = "📞 INCOMING CALL: AgriMarket Call-E Agent"
    p_ch1.font.name = FONT_NAME
    p_ch1.font.bold = True
    p_ch1.font.size = Pt(9.5)
    p_ch1.font.color.rgb = COLOR_PRIMARY_DARK
    p_ch1.alignment = PP_ALIGN.CENTER
    p_ch2 = tf_ch.add_paragraph()
    p_ch2.text = "● Connected • Native Spoken Dialect • 00:48"
    p_ch2.font.name = FONT_NAME
    p_ch2.font.size = Pt(8.5)
    p_ch2.font.color.rgb = COLOR_ACCENT
    p_ch2.alignment = PP_ALIGN.CENTER

    tb_ph = s9.shapes.add_textbox(Inches(1.05), Inches(2.55), phone_w - Inches(0.5), Inches(3.5))
    tf_ph = tb_ph.text_frame
    tf_ph.word_wrap = True
    tf_ph.margin_left = tf_ph.margin_top = tf_ph.margin_right = tf_ph.margin_bottom = 0

    dialogue = [
        ("Farmer: ", "'I need 2 packets of Arka Rakshak tomato seeds and 5 bags of Bio-NPK fertilizer.'"),
        ("Call-E AI: ", "'Checking Mandya stock... Yes! Seeds available at ₹450/packet, Bio-NPK at ₹650/bag. Total is ₹4,150.'"),
        ("Farmer: ", "'Confirm the order to Plot 4B.'"),
        ("Call-E AI: ", "'Confirmed! Order AGRI-BOOK-10245 placed. Delivery tomorrow by 10 AM. SMS receipt sent.'")
    ]
    for spk, text in dialogue:
        p_d = tf_ph.add_paragraph() if tf_ph.paragraphs[0].text else tf_ph.paragraphs[0]
        p_d.text = spk
        p_d.font.name = FONT_NAME
        p_d.font.bold = True
        p_d.font.size = Pt(9.5)
        p_d.font.color.rgb = COLOR_PRIMARY_DARK if "Call-E" in spk else COLOR_TEXT_MAIN
        p_d.space_before = Pt(8)
        run = p_d.add_run()
        run.text = text
        run.font.bold = False
        run.font.color.rgb = COLOR_TEXT_MUTED

    # Bottom booking confirmation pill in phone card
    add_card_chip(s9, Inches(1.05), Inches(6.25), phone_w - Inches(0.5), Inches(0.4), "✅ Order AGRI-BOOK-10245 Confirmed • SMS Dispatched", COLOR_WHITE, COLOR_BORDER_GREEN, COLOR_PRIMARY, 8.5)

    step_rw = Inches(6.933)
    step_rx = Inches(5.6)
    step_h = Inches(1.22)

    call_steps = [
        ("STEP 1: ONE-CLICK TRIGGER", "Farmer clicks 'Initiate Call' on dashboard or dials toll-free line. Call-E API immediately dials farmer's mobile phone.", "Trigger: Web Dashboard or In-Field Dial-In"),
        ("STEP 2: NATURAL VOICE DIALOGUE", "Farmer speaks naturally in Kannada, Hindi, or English. Conversational NLU understands crop types and input quantities.", "NLU: Multilingual Speech-to-Text & LLM Parser"),
        ("STEP 3: LIVE PRICE & STOCK LOOKUP", "Call-E queries live database: quotes verified APMC mandi prices, confirms warehouse inventory, and provides delivery timeline.", "Data: APMC Mandi Rates & Live Warehouse Stock"),
        ("STEP 4: INSTANT ORDER BOOKING", "Farmer agrees on quote. Call-E locks inventory, generates booking ID (AGRI-BOOK-xxxx), and triggers 5-stage logistics dispatch.", "Fulfillment: SHA-256 Batch Lock & Instant SMS")
    ]

    for s_idx, (stitle, sdesc, sbadge) in enumerate(call_steps):
        sy = Inches(1.55) + s_idx * Inches(1.34)
        c_step = add_modern_card(s9, step_rx, sy, step_rw, step_h, COLOR_WHITE, COLOR_BORDER_LIGHT)

        # Right badge on step card
        add_card_chip(s9, step_rx + step_rw - Inches(3.0), sy + Inches(0.12), Inches(2.8), Inches(0.24), sbadge, COLOR_CARD_MINT, COLOR_BORDER_GREEN, COLOR_PRIMARY, 7.5)

        tb_s = s9.shapes.add_textbox(step_rx + Inches(0.2), sy + Inches(0.12), step_rw - Inches(3.2), Inches(0.35))
        tf_s = tb_s.text_frame
        tf_s.margin_left = tf_s.margin_top = tf_s.margin_right = tf_s.margin_bottom = 0
        p = tf_s.paragraphs[0]
        p.text = stitle
        p.font.name = FONT_NAME
        p.font.bold = True
        p.font.size = Pt(10.5)
        p.font.color.rgb = COLOR_PRIMARY_DARK

        tb_desc = s9.shapes.add_textbox(step_rx + Inches(0.2), sy + Inches(0.48), step_rw - Inches(0.4), Inches(0.65))
        tf_desc = tb_desc.text_frame
        tf_desc.word_wrap = True
        tf_desc.margin_left = tf_desc.margin_top = tf_desc.margin_right = tf_desc.margin_bottom = 0
        p_desc = tf_desc.paragraphs[0]
        p_desc.text = sdesc
        p_desc.font.name = FONT_NAME
        p_desc.font.size = Pt(9.5)
        p_desc.font.color.rgb = COLOR_TEXT_MUTED
        p_desc.line_spacing = 1.25

    # =========================================================================
    # SLIDE 10: AgriMarket Platform & 5-Stage Logistics Stepper
    # =========================================================================
    s10 = create_base_slide(10)
    add_header(s10, "Digital Marketplace", "AgriMarket: Peer-to-Peer Hub & 5-Stage Logistics", "Transparent community marketplace with end-to-end supply chain visibility and immutable verification.")

    stepper_card = add_modern_card(s10, Inches(0.8), Inches(1.55), Inches(11.733), Inches(1.15), COLOR_CARD_MINT, COLOR_BORDER_GREEN, 1.2)
    
    step_names = [
        ("1. Placed", "Call-E / Web lock"),
        ("2. Confirmed", "Supplier SMS sent"),
        ("3. Processing", "Batch hash tagged"),
        ("4. Dispatched", "GPS vehicle transit"),
        ("5. Delivered", "Village gate OTP")
    ]
    st_w = Inches(2.2)
    for si, (sname, ssub) in enumerate(step_names):
        st_x = Inches(1.0) + si * Inches(2.3)
        tb_st = s10.shapes.add_textbox(st_x, Inches(1.70), st_w, Inches(0.85))
        tf_st = tb_st.text_frame
        tf_st.word_wrap = True
        tf_st.margin_left = tf_st.margin_top = tf_st.margin_right = tf_st.margin_bottom = 0
        p = tf_st.paragraphs[0]
        p.text = "✔ " + sname
        p.font.name = FONT_NAME
        p.font.bold = True
        p.font.size = Pt(11)
        p.font.color.rgb = COLOR_PRIMARY
        p_sub = tf_st.add_paragraph()
        p_sub.text = ssub
        p_sub.font.name = FONT_NAME
        p_sub.font.size = Pt(8.5)
        p_sub.font.color.rgb = COLOR_TEXT_MUTED
        p_sub.space_before = Pt(2)

    bot_w = Inches(5.65)
    bot_card_h = Inches(3.95)

    c_m1 = add_modern_card(s10, Inches(0.8), Inches(2.85), bot_w, bot_card_h, COLOR_WHITE, COLOR_BORDER_LIGHT)

    tb_m1 = s10.shapes.add_textbox(Inches(1.05), Inches(3.0), bot_w - Inches(0.5), Inches(3.1))
    tf_m1 = tb_m1.text_frame
    tf_m1.word_wrap = True
    tf_m1.margin_left = tf_m1.margin_top = tf_m1.margin_right = tf_m1.margin_bottom = 0

    p = tf_m1.paragraphs[0]
    p.text = "PEER-TO-PEER COMMUNITY COMMERCE"
    p.font.name = FONT_NAME
    p.font.bold = True
    p.font.size = Pt(12)
    p.font.color.rgb = COLOR_PRIMARY_DARK

    mkt_features = [
        ("Direct Farmer-to-Farmer Exchange: ", "Farmers buy and sell surplus organic manure, certified seeds, or rent idle machinery locally without middleman cuts."),
        ("Fair Mandi Price Discovery: ", "Aggregates regional APMC mandi rates to prevent distress selling and eliminate 40%–60% dealer markups."),
        ("Equipment Sharing Economy: ", "Rent high-value tractors, seed drills, and power tillers on an hourly or daily basis to reduce capital expense."),
        ("Quality Assurance Badges: ", "Input verification badges ensure certified seed germination rates and authentic laboratory-tested fertilizer batches.")
    ]
    for title, desc in mkt_features:
        bp = tf_m1.add_paragraph()
        bp.text = "• " + title
        bp.font.name = FONT_NAME
        bp.font.bold = True
        bp.font.size = Pt(9.5)
        bp.font.color.rgb = COLOR_TEXT_MAIN
        bp.space_before = Pt(7)
        run = bp.add_run()
        run.text = desc
        run.font.bold = False
        run.font.color.rgb = COLOR_TEXT_MUTED

    add_card_chip(s10, Inches(1.05), Inches(6.32), bot_w - Inches(0.5), Inches(0.36), "🤝 Direct P2P Trading Saves 20%–30% on Agricultural Inputs", COLOR_CARD_MINT, COLOR_BORDER_GREEN, COLOR_PRIMARY, 8.5)

    c_m2 = add_modern_card(s10, Inches(6.85), Inches(2.85), bot_w, bot_card_h, COLOR_WHITE, COLOR_BORDER_LIGHT)

    tb_m2 = s10.shapes.add_textbox(Inches(7.1), Inches(3.0), bot_w - Inches(0.5), Inches(3.1))
    tf_m2 = tb_m2.text_frame
    tf_m2.word_wrap = True
    tf_m2.margin_left = tf_m2.margin_top = tf_m2.margin_right = tf_m2.margin_bottom = 0

    p = tf_m2.paragraphs[0]
    p.text = "CRYPTOGRAPHIC SUPPLY CHAIN INTEGRITY"
    p.font.name = FONT_NAME
    p.font.bold = True
    p.font.size = Pt(12)
    p.font.color.rgb = COLOR_PRIMARY_DARK

    crypto_features = [
        ("SHA-256 Immutable Hash: ", "Every commodity transaction generates a cryptographic fingerprint verifying product batch, timestamp, and pricing."),
        ("Dispute-Free Settlements: ", "Eliminates counterparty disputes between farmers, logistics drivers, and certified input suppliers."),
        ("Village Gate Handover OTP: ", "Secure SMS OTP delivery verification ensures goods are delivered directly to the authorized recipient."),
        ("Government Subsidy Readiness: ", "Audit-ready transaction records format seamlessly for DBT (Direct Benefit Transfer) government subsidies.")
    ]
    for title, desc in crypto_features:
        bp = tf_m2.add_paragraph()
        bp.text = "• " + title
        bp.font.name = FONT_NAME
        bp.font.bold = True
        bp.font.size = Pt(9.5)
        bp.font.color.rgb = COLOR_TEXT_MAIN
        bp.space_before = Pt(7)
        run = bp.add_run()
        run.text = desc
        run.font.bold = False
        run.font.color.rgb = COLOR_TEXT_MUTED

    add_card_chip(s10, Inches(7.1), Inches(6.32), bot_w - Inches(0.5), Inches(0.36), "🔒 SHA-256 Hashes Eliminate Counterfeit Inputs & Fraud", COLOR_CARD_MINT, COLOR_BORDER_GREEN, COLOR_PRIMARY, 8.5)

    # =========================================================================
    # SLIDE 11: Real-World Agronomic & Economic Impact
    # =========================================================================
    s11 = create_base_slide(11)
    add_header(s11, "Measurable Impact", "Transforming Smallholder Agriculture & Farmer Livelihoods", "Quantitative metrics and tangible outcomes delivered by the AgriSense platform.")

    m4_w = Inches(2.7)
    m4_gap = Inches(0.3)
    m4_x = Inches(0.8)

    metrics_list = [
        ("35%", "Water Conservation", "Root-zone threshold gating stops wasteful irrigation and prevents root asphyxiation (>85% alarm).", "💧 Reduced Pumping Power"),
        ("25%", "Fertilizer Reduction", "Targeted satellite NDVI application prevents excessive broadcast chemical fertilizer use.", "🌱 Reduced Soil Acidity"),
        ("100%", "Voice Accessibility", "Zero literacy barrier: any farmer can enquire and book supplies using natural phone calls via Call-E.", "🗣️ Universal Phone Access"),
        ("20%+", "Higher Net Income", "Direct farmer-to-farmer trade and transparent price discovery eliminates predatory middleman fees.", "💰 Direct Margin Capture")
    ]

    for i, (mval, mlabel, mdesc, mchip) in enumerate(metrics_list):
        mx = m4_x + i * (m4_w + m4_gap)
        mc = add_modern_card(s11, mx, Inches(1.55), m4_w, Inches(3.0), COLOR_CARD_MINT, COLOR_BORDER_GREEN, 1.2)

        tb = s11.shapes.add_textbox(mx + Inches(0.15), Inches(1.70), m4_w - Inches(0.3), Inches(2.2))
        tf = tb.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0

        p_v = tf.paragraphs[0]
        p_v.text = mval
        p_v.font.name = FONT_NAME
        p_v.font.bold = True
        p_v.font.size = Pt(38)
        p_v.font.color.rgb = COLOR_PRIMARY_DARK
        p_v.alignment = PP_ALIGN.CENTER

        p_l = tf.add_paragraph()
        p_l.text = mlabel
        p_l.font.name = FONT_NAME
        p_l.font.bold = True
        p_l.font.size = Pt(11.5)
        p_l.font.color.rgb = COLOR_PRIMARY
        p_l.alignment = PP_ALIGN.CENTER
        p_l.space_before = Pt(3)
        p_l.space_after = Pt(6)

        p_d = tf.add_paragraph()
        p_d.text = mdesc
        p_d.font.name = FONT_NAME
        p_d.font.size = Pt(9)
        p_d.font.color.rgb = COLOR_TEXT_MUTED
        p_d.line_spacing = 1.25

        add_card_chip(s11, mx + Inches(0.15), Inches(4.08), m4_w - Inches(0.3), Inches(0.34), mchip, COLOR_WHITE, COLOR_BORDER_GREEN, COLOR_PRIMARY, 8.5)

    c_roi = add_modern_card(s11, Inches(0.8), Inches(4.75), Inches(11.733), Inches(2.05), COLOR_WHITE, COLOR_BORDER_LIGHT)

    tb_roi = s11.shapes.add_textbox(Inches(1.05), Inches(4.90), Inches(11.233), Inches(1.75))
    tf_roi = tb_roi.text_frame
    tf_roi.word_wrap = True
    tf_roi.margin_left = tf_roi.margin_top = tf_roi.margin_right = tf_roi.margin_bottom = 0

    p = tf_roi.paragraphs[0]
    p.text = "TANGIBLE SOCIO-ECONOMIC RETURN ON INVESTMENT (ROI)"
    p.font.name = FONT_NAME
    p.font.bold = True
    p.font.size = Pt(11.5)
    p.font.color.rgb = COLOR_PRIMARY_DARK

    roi_bullets = [
        ("Annual Savings per Acre: ", "Farmers save approximately ₹12,000–₹18,000 per acre through optimized water pumping and reduced chemical fertilizer waste."),
        ("Fast Payback Period: ", "The low-cost ESP32 sensing node and rover amortize within a single 120-day crop cycle (e.g. Paddy or Tomato)."),
        ("Social Equity & Inclusion: ", "Empowers non-literate smallholders and elderly farmers with sovereign voice access to certified agricultural inputs.")
    ]
    for rtitle, rdesc in roi_bullets:
        bp = tf_roi.add_paragraph()
        bp.text = "✔ " + rtitle
        bp.font.name = FONT_NAME
        bp.font.bold = True
        bp.font.size = Pt(10)
        bp.font.color.rgb = COLOR_PRIMARY
        bp.space_before = Pt(4)
        run = bp.add_run()
        run.text = rdesc
        run.font.bold = False
        run.font.color.rgb = COLOR_TEXT_MUTED

    # =========================================================================
    # SLIDE 12: Summary & Scalability Roadmap + Hardware Matrix
    # =========================================================================
    s12 = create_base_slide(12)
    add_header(s12, "Summary & Roadmap", "The Future of Connected Smart Agriculture", "Scaling from laboratory prototype to millions of smallholder farming communities.")

    c_sum1 = add_modern_card(s12, Inches(0.8), Inches(1.55), bot_w, Inches(3.6), COLOR_CARD_MINT, COLOR_BORDER_GREEN, 1.2)

    tb_s1 = s12.shapes.add_textbox(Inches(1.05), Inches(1.70), bot_w - Inches(0.5), Inches(2.75))
    tf_s1 = tb_s1.text_frame
    tf_s1.word_wrap = True
    tf_s1.margin_left = tf_s1.margin_top = tf_s1.margin_right = tf_s1.margin_bottom = 0

    p = tf_s1.paragraphs[0]
    p.text = "CORE PROJECT ACCOMPLISHMENTS"
    p.font.name = FONT_NAME
    p.font.bold = True
    p.font.size = Pt(12)
    p.font.color.rgb = COLOR_PRIMARY_DARK

    summary_pts = [
        ("Full Cyber-Physical Loop: ", "Integrated ground ESP32 sensing, mobile rover, orbital satellite NDVI, and Call-E voice agentic commerce."),
        ("Real Hardware Testbed Validated: ", "Live 2.8\" SPI TFT LCD renders real-time telemetry; continuous buzzer sounds only above 85% soil moisture."),
        ("Autonomous Locomotion: ", "Robotic tractor follows crop furrows using dual IR reflectance sensors and avoids obstacles autonomously."),
        ("Agentic Supply Booking: ", "Call-E automated phone call system enables farmers to enquiry, verify pricing, and book supplies via natural speech.")
    ]
    for title, desc in summary_pts:
        bp = tf_s1.add_paragraph()
        bp.text = "✔ " + title
        bp.font.name = FONT_NAME
        bp.font.bold = True
        bp.font.size = Pt(9.5)
        bp.font.color.rgb = COLOR_PRIMARY
        bp.space_before = Pt(4)
        run = bp.add_run()
        run.text = desc
        run.font.bold = False
        run.font.color.rgb = COLOR_TEXT_MUTED

    add_card_chip(s12, Inches(1.05), Inches(4.68), bot_w - Inches(0.5), Inches(0.36), "🏆 Complete Functional Cyber-Physical Prototype Validated", COLOR_WHITE, COLOR_BORDER_GREEN, COLOR_PRIMARY, 8.5)

    c_sum2 = add_modern_card(s12, Inches(6.85), Inches(1.55), bot_w, Inches(3.6), COLOR_WHITE, COLOR_BORDER_LIGHT)

    tb_s2 = s12.shapes.add_textbox(Inches(7.1), Inches(1.70), bot_w - Inches(0.5), Inches(2.75))
    tf_s2 = tb_s2.text_frame
    tf_s2.word_wrap = True
    tf_s2.margin_left = tf_s2.margin_top = tf_s2.margin_right = tf_s2.margin_bottom = 0

    p = tf_s2.paragraphs[0]
    p.text = "FUTURE COMMERCIAL ROADMAP"
    p.font.name = FONT_NAME
    p.font.bold = True
    p.font.size = Pt(12)
    p.font.color.rgb = COLOR_PRIMARY_DARK

    roadmap_pts = [
        ("LoRaWAN Long-Range Mesh: ", "15km sub-GHz wireless mesh linking hundreds of farm sensor nodes to a single cellular gateway."),
        ("Solar Self-Recharging Rover: ", "Continuous in-field solar battery recharging and autonomous nighttime furrow patrolling."),
        ("Drone Multispectral Thermal Imaging: ", "Automated drone flyovers for millimeter-precision foliar disease thermal scanning."),
        ("Government e-NAM & Insurance Integration: ", "Direct linkage with national mandi portals and automated satellite crop insurance claims.")
    ]
    for title, desc in roadmap_pts:
        bp = tf_s2.add_paragraph()
        bp.text = "🚀 " + title
        bp.font.name = FONT_NAME
        bp.font.bold = True
        bp.font.size = Pt(9.5)
        bp.font.color.rgb = COLOR_PRIMARY_DARK
        bp.space_before = Pt(4)
        run = bp.add_run()
        run.text = desc
        run.font.bold = False
        run.font.color.rgb = COLOR_TEXT_MUTED

    add_card_chip(s12, Inches(7.1), Inches(4.68), bot_w - Inches(0.5), Inches(0.36), "🚀 High-Scalability Architecture Ready for Commercial Mandi Scale", COLOR_CARD_MINT, COLOR_BORDER_GREEN, COLOR_PRIMARY, 8.5)

    # Bottom Tech Stack Matrix Banner
    bot_b12 = add_modern_card(s12, Inches(0.8), Inches(5.35), Inches(11.733), Inches(1.45), COLOR_CARD_MINT, COLOR_BORDER_GREEN, 1.2)
    tb_b12 = s12.shapes.add_textbox(Inches(1.05), Inches(5.45), Inches(11.233), Inches(1.25))
    tf_b12 = tb_b12.text_frame
    tf_b12.word_wrap = True
    tf_b12.margin_left = tf_b12.margin_top = tf_b12.margin_right = tf_b12.margin_bottom = 0

    p = tf_b12.paragraphs[0]
    p.text = "COMPLETE SYSTEM TECHNOLOGY SPECIFICATION MATRIX"
    p.font.name = FONT_NAME
    p.font.bold = True
    p.font.size = Pt(11)
    p.font.color.rgb = COLOR_PRIMARY_DARK

    p_mat = tf_b12.add_paragraph()
    p_mat.text = "Edge Microcontroller: ESP32-WROOM-32 (240MHz Xtensa) • Display: 2.8\" SPI ILI9341 Color TFT • Mobile Robotics: 2WD 1:48 TT Gearmotors + TCRT5000 IR Array • Satellite Engine: SpaceNet & Sentinel-2 NDVI + MobileNetV2 CNN • Voice NLU: Call-E Agentic Webhook API • Cloud Server: Node.js HTTP/SSE"
    p_mat.font.name = FONT_NAME
    p_mat.font.size = Pt(9.5)
    p_mat.font.color.rgb = COLOR_TEXT_MUTED
    p_mat.space_before = Pt(4)
    p_mat.line_spacing = 1.35

    # Output paths
    output_filename = "AgriSense_AgriMarket_Pitch.pptx"
    local_path = os.path.join(base_dir, output_filename)
    prs.save(local_path)
    print(f"[SUCCESS] High-fidelity presentation saved locally to: {local_path}")

    desktop_paths = [
        r"C:\Users\Manus\OneDrive\Desktop",
        r"C:\Users\Manus\Desktop"
    ]
    for dp in desktop_paths:
        if os.path.exists(dp):
            dest = os.path.join(dp, output_filename)
            shutil.copyfile(local_path, dest)
            print(f"[SUCCESS] Copied to Desktop path: {dest}")

if __name__ == "__main__":
    generate_deck()
