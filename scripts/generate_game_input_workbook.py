#!/usr/bin/env python3
import json
import os
import re
import zipfile
from datetime import datetime, timezone
from pathlib import Path
from xml.sax.saxutils import escape


ROOT = Path(__file__).resolve().parents[1]
THREAD_ID = os.environ.get("CODEX_THREAD_ID", "manual")
OUTPUT_DIR = ROOT / "outputs" / THREAD_ID

HEADERS = [
    "card_id",
    "icon",
    "scenario_text",
    "left_choice_text",
    "left_family",
    "left_scouting",
    "left_school",
    "left_energy",
    "right_choice_text",
    "right_family",
    "right_scouting",
    "right_school",
    "right_energy",
    "status",
    "editor_notes",
]

LOCALIZED = {
    "pl": {
        "cards_path": ROOT / "src" / "data" / "cards.json",
        "output": OUTPUT_DIR / "scout-life-balance-template-pl.xlsx",
        "title": "Scout Life Balance - szablon kart PL",
        "instruction_title": "Jak edytowac ten szablon",
        "settings_title": "Ustawienia gry",
        "summary_title": "Podsumowanie i szybkie kontrole",
        "human_headers": [
            "Unikalny numer",
            "Emoji albo URL obrazka",
            "Sytuacja widoczna na karcie",
            "Decyzja po przesunieciu w lewo",
            "Lewo: rodzina",
            "Lewo: druzyna",
            "Lewo: szkola",
            "Lewo: energia",
            "Decyzja po przesunieciu w prawo",
            "Prawo: rodzina",
            "Prawo: druzyna",
            "Prawo: szkola",
            "Prawo: energia",
            "Active/Draft/Inactive",
            "Notatki redakcyjne",
        ],
        "import_note": "Zaimportowano z obecnego cards.json",
        "blank_note": "Nowa karta - uzupelnij tekst i ustaw status Active, gdy gotowa",
        "instructions": [
            ("Najwazniejsze", "Gra czyta tylko zakladke Cards. Nie zmieniaj technicznych naglowkow w pierwszym wierszu."),
            ("Status", "Active = karta trafi do gry. Draft = robocza. Inactive = odlozona na pozniej."),
            ("Efekty", "Wpisuj liczby calkowite od -3 do 3. Plus zwieksza zasob, minus go zmniejsza."),
            ("Skala", "1 to maly wplyw, 2 sredni, 3 duzy/kryzysowy. Kod gry mnozy te wartosci przez 8."),
            ("ID", "Kazda karta musi miec unikalne card_id. Dla nowych kart uzyj kolejnego wolnego numeru."),
            ("Teksty", "scenario_text to opis sytuacji. left/right_choice_text to decyzje gracza."),
            ("Obrazek", "icon moze byc emoji albo URL obrazka. Emoji sa najprostsze i najlepiej dzialaja."),
            ("Udostepnianie", "Po wrzuceniu do Google Sheets ustaw: kazdy z linkiem moze wyswietlac."),
        ],
        "resource_labels": {
            "family": "Rodzina i przyjaciele",
            "scouting": "Druzyna / harcerstwo",
            "school": "Szkola / studia",
            "energy": "Energia / zdrowie",
        },
        "summary_labels": {
            "active": "Aktywne karty",
            "draft": "Robocze karty",
            "inactive": "Nieaktywne karty",
            "missing": "Puste opisy sytuacji",
            "duplicates": "Duplikaty ID",
        },
    },
    "en": {
        "cards_path": ROOT / "src" / "data" / "cards.en.json",
        "output": OUTPUT_DIR / "scout-life-balance-template-en.xlsx",
        "title": "Scout Life Balance - EN card template",
        "instruction_title": "How to edit this template",
        "settings_title": "Game settings",
        "summary_title": "Summary and quick checks",
        "human_headers": [
            "Unique number",
            "Emoji or image URL",
            "Situation shown on the card",
            "Decision when swiped left",
            "Left: family",
            "Left: scouting",
            "Left: school",
            "Left: energy",
            "Decision when swiped right",
            "Right: family",
            "Right: scouting",
            "Right: school",
            "Right: energy",
            "Active/Draft/Inactive",
            "Editor notes",
        ],
        "import_note": "Imported from current cards.en.json",
        "blank_note": "New card - fill text and set status to Active when ready",
        "instructions": [
            ("Most important", "The game reads only the Cards tab. Do not rename the technical headers in row 1."),
            ("Status", "Active = included in the game. Draft = work in progress. Inactive = parked for later."),
            ("Effects", "Use whole numbers from -3 to 3. Positive values increase a resource; negative values decrease it."),
            ("Scale", "1 is small, 2 is medium, 3 is large/crisis impact. The game code multiplies these values by 8."),
            ("ID", "Every card needs a unique card_id. For new cards, use the next available number."),
            ("Texts", "scenario_text is the situation. left/right_choice_text are the player's decisions."),
            ("Image", "icon can be an emoji or image URL. Emoji are simplest and most reliable."),
            ("Sharing", "After uploading to Google Sheets, set sharing to anyone with the link can view."),
        ],
        "resource_labels": {
            "family": "Family and friends",
            "scouting": "Scout unit",
            "school": "School / studies",
            "energy": "Energy / health",
        },
        "summary_labels": {
            "active": "Active cards",
            "draft": "Draft cards",
            "inactive": "Inactive cards",
            "missing": "Blank scenario texts",
            "duplicates": "Duplicate IDs",
        },
    },
}


def col_name(index):
    name = ""
    while index:
        index, rem = divmod(index - 1, 26)
        name = chr(65 + rem) + name
    return name


def cell_ref(row, col):
    return f"{col_name(col)}{row}"


def sanitize_sheet_name(name):
    return re.sub(r"[\[\]\*\/\\\?:]", "_", name)[:31]


def string_cell(row, col, value, style=None):
    attrs = [f'r="{cell_ref(row, col)}"', 't="inlineStr"']
    if style is not None:
        attrs.append(f's="{style}"')
    if value is None or value == "":
        return f"<c {' '.join(attrs)}/>"
    return f"<c {' '.join(attrs)}><is><t>{escape(str(value))}</t></is></c>"


def number_cell(row, col, value, style=None):
    attrs = [f'r="{cell_ref(row, col)}"']
    if style is not None:
        attrs.append(f's="{style}"')
    if value is None or value == "":
        return f"<c {' '.join(attrs)}/>"
    return f"<c {' '.join(attrs)}><v>{value}</v></c>"


def formula_cell(row, col, formula, style=None):
    attrs = [f'r="{cell_ref(row, col)}"']
    if style is not None:
        attrs.append(f's="{style}"')
    return f"<c {' '.join(attrs)}><f>{escape(formula)}</f></c>"


def row_xml(row_num, cells, height=None):
    attrs = [f'r="{row_num}"']
    if height:
        attrs += [f'ht="{height}"', 'customHeight="1"']
    return f"<row {' '.join(attrs)}>{''.join(cells)}</row>"


def sheet_xml(name, rows, cols, freeze_row=None, auto_filter=None, validations=None):
    max_row = max((r for r, _ in rows), default=1)
    max_col = max((c for _, row in rows for c in row), default=1)
    row_map = {r: row for r, row in rows}
    row_blocks = []
    for row_num in range(1, max_row + 1):
        row = row_map.get(row_num)
        if not row:
            continue
        height = 18
        if name == "Cards" and row_num == 2:
            height = 42
        elif name == "Cards" and row_num >= 3:
            height = 54
        elif row_num == 1:
            height = 28
        cells = [row[c] for c in sorted(row)]
        row_blocks.append(row_xml(row_num, cells, height))

    col_blocks = [
        f'<col min="{start}" max="{end}" width="{width}" customWidth="1"/>'
        for start, end, width in cols
    ]
    if freeze_row:
        views = (
            '<sheetViews><sheetView workbookViewId="0">'
            f'<pane ySplit="{freeze_row}" topLeftCell="A{freeze_row + 1}" activePane="bottomLeft" state="frozen"/>'
            "</sheetView></sheetViews>"
        )
    else:
        views = '<sheetViews><sheetView workbookViewId="0"/></sheetViews>'

    auto_filter_xml = f'<autoFilter ref="{auto_filter}"/>' if auto_filter else ""
    validation_xml = ""
    if validations:
        validation_xml = f'<dataValidations count="{len(validations)}">{"".join(validations)}</dataValidations>'

    return (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" '
        'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">'
        f'<dimension ref="A1:{cell_ref(max_row, max_col)}"/>'
        f'{views}<sheetFormatPr defaultRowHeight="15"/>'
        f"<cols>{''.join(col_blocks)}</cols>"
        f"<sheetData>{''.join(row_blocks)}</sheetData>"
        f"{auto_filter_xml}{validation_xml}"
        "</worksheet>"
    )


def workbook_xml(sheet_names):
    sheets = []
    for idx, name in enumerate(sheet_names, 1):
        sheets.append(f'<sheet name="{escape(sanitize_sheet_name(name))}" sheetId="{idx}" r:id="rId{idx}"/>')
    return (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" '
        'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">'
        "<workbookPr/><bookViews><workbookView/></bookViews>"
        f"<sheets>{''.join(sheets)}</sheets>"
        '<calcPr calcId="191029" fullCalcOnLoad="1"/>'
        "</workbook>"
    )


def workbook_rels(sheet_count):
    rels = []
    for idx in range(1, sheet_count + 1):
        rels.append(
            f'<Relationship Id="rId{idx}" '
            'Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" '
            f'Target="worksheets/sheet{idx}.xml"/>'
        )
    rels.append(
        f'<Relationship Id="rId{sheet_count + 1}" '
        'Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" '
        'Target="styles.xml"/>'
    )
    return (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
        f"{''.join(rels)}</Relationships>"
    )


def styles_xml():
    return """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="6">
    <font><sz val="11"/><name val="Calibri"/></font>
    <font><b/><sz val="15"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font>
    <font><b/><sz val="10"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font>
    <font><b/><sz val="10"/><color rgb="FF1F2937"/><name val="Calibri"/></font>
    <font><i/><sz val="10"/><color rgb="FF6B7280"/><name val="Calibri"/></font>
    <font><b/><sz val="11"/><color rgb="FF064E3B"/><name val="Calibri"/></font>
  </fonts>
  <fills count="8">
    <fill><patternFill patternType="none"/></fill>
    <fill><patternFill patternType="gray125"/></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FF355C7D"/><bgColor indexed="64"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FF2F6F4E"/><bgColor indexed="64"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFF3F4F6"/><bgColor indexed="64"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFFFF7D6"/><bgColor indexed="64"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFE8F0FE"/><bgColor indexed="64"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFE7F8EF"/><bgColor indexed="64"/></patternFill></fill>
  </fills>
  <borders count="2">
    <border><left/><right/><top/><bottom/><diagonal/></border>
    <border><left style="thin"><color rgb="FFD1D5DB"/></left><right style="thin"><color rgb="FFD1D5DB"/></right><top style="thin"><color rgb="FFD1D5DB"/></top><bottom style="thin"><color rgb="FFD1D5DB"/></bottom><diagonal/></border>
  </borders>
  <cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/></cellStyleXfs>
  <cellXfs count="9">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
    <xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1"><alignment vertical="center"/></xf>
    <xf numFmtId="0" fontId="2" fillId="3" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="0" fillId="4" borderId="1" xfId="0" applyFill="1" applyBorder="1"><alignment vertical="top" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="0" fillId="5" borderId="1" xfId="0" applyFill="1" applyBorder="1"><alignment horizontal="center" vertical="center"/></xf>
    <xf numFmtId="0" fontId="3" fillId="6" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1"><alignment vertical="center" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="4" fillId="0" borderId="0" xfId="0" applyFont="1"><alignment vertical="top" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1"><alignment vertical="center"/></xf>
    <xf numFmtId="0" fontId="5" fillId="7" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1"><alignment vertical="center" wrapText="1"/></xf>
  </cellXfs>
  <cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
</styleSheet>"""


def content_types(sheet_count):
    sheets = "".join(
        f'<Override PartName="/xl/worksheets/sheet{i}.xml" '
        'ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>'
        for i in range(1, sheet_count + 1)
    )
    return (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
        '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'
        '<Default Extension="xml" ContentType="application/xml"/>'
        '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>'
        f"{sheets}"
        '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>'
        '<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>'
        '<Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>'
        "</Types>"
    )


def package_rels():
    return (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
        '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>'
        '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>'
        '<Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>'
        "</Relationships>"
    )


def doc_props(sheet_names, title):
    now = datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")
    app = (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" '
        'xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">'
        "<Application>Codex</Application><DocSecurity>0</DocSecurity><ScaleCrop>false</ScaleCrop>"
        f'<HeadingPairs><vt:vector size="2" baseType="variant"><vt:variant><vt:lpstr>Worksheets</vt:lpstr></vt:variant><vt:variant><vt:i4>{len(sheet_names)}</vt:i4></vt:variant></vt:vector></HeadingPairs>'
        f'<TitlesOfParts><vt:vector size="{len(sheet_names)}" baseType="lpstr">'
        + "".join(f"<vt:lpstr>{escape(name)}</vt:lpstr>" for name in sheet_names)
        + "</vt:vector></TitlesOfParts></Properties>"
    )
    core = (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" '
        'xmlns:dc="http://purl.org/dc/elements/1.1/" '
        'xmlns:dcterms="http://purl.org/dc/terms/" '
        'xmlns:dcmitype="http://purl.org/dc/dcmitype/" '
        'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">'
        f"<dc:title>{escape(title)}</dc:title><dc:creator>Codex</dc:creator>"
        f'<dcterms:created xsi:type="dcterms:W3CDTF">{now}</dcterms:created>'
        f'<dcterms:modified xsi:type="dcterms:W3CDTF">{now}</dcterms:modified>'
        "</cp:coreProperties>"
    )
    return core, app


def build_cards_sheet(cards, labels):
    rows = []
    rows.append((1, {idx: string_cell(1, idx, header, 2) for idx, header in enumerate(HEADERS, 1)}))
    rows.append((2, {idx: string_cell(2, idx, label, 8) for idx, label in enumerate(labels["human_headers"], 1)}))

    max_rows = 100
    for offset in range(max_rows):
        excel_row = offset + 3
        if offset < len(cards):
            card = cards[offset]
            left = card.get("leftChoice", {})
            right = card.get("rightChoice", {})
            left_fx = left.get("effects", {})
            right_fx = right.get("effects", {})
            values = [
                card.get("id", ""),
                card.get("image", ""),
                card.get("description", ""),
                left.get("text", ""),
                left_fx.get("family", 0),
                left_fx.get("scouting", 0),
                left_fx.get("school", 0),
                left_fx.get("energy", 0),
                right.get("text", ""),
                right_fx.get("family", 0),
                right_fx.get("scouting", 0),
                right_fx.get("school", 0),
                right_fx.get("energy", 0),
                "Active",
                labels["import_note"],
            ]
        else:
            values = ["", "", "", "", 0, 0, 0, 0, "", 0, 0, 0, 0, "Draft", labels["blank_note"]]

        row = {}
        for idx, value in enumerate(values, 1):
            if idx in {1, 5, 6, 7, 8, 10, 11, 12, 13}:
                row[idx] = number_cell(excel_row, idx, value, 4 if idx != 1 else 7)
            elif idx == 14:
                row[idx] = string_cell(excel_row, idx, value, 5)
            else:
                row[idx] = string_cell(excel_row, idx, value, 3)
        rows.append((excel_row, row))

    validations = [
        '<dataValidation type="whole" operator="between" allowBlank="1" showErrorMessage="1" errorTitle="Effect scale" error="Use a whole number from -3 to 3." sqref="E3:H102 J3:M102"><formula1>-3</formula1><formula2>3</formula2></dataValidation>',
        '<dataValidation type="list" allowBlank="0" showErrorMessage="1" errorTitle="Choose a status" error="Use Active, Draft, or Inactive." sqref="N3:N102"><formula1>"Active,Draft,Inactive"</formula1></dataValidation>',
    ]
    cols = [
        (1, 1, 11),
        (2, 2, 10),
        (3, 3, 58),
        (4, 4, 34),
        (5, 8, 11),
        (9, 9, 34),
        (10, 13, 11),
        (14, 14, 14),
        (15, 15, 34),
    ]
    return rows, cols, validations


def build_instructions_sheet(labels):
    rows = [(1, {1: string_cell(1, 1, labels["instruction_title"], 1)})]
    rows.append((3, {1: string_cell(3, 1, "Topic", 2), 2: string_cell(3, 2, "Guidance", 2)}))
    for idx, (topic, guidance) in enumerate(labels["instructions"], 4):
        rows.append((idx, {1: string_cell(idx, 1, topic, 5), 2: string_cell(idx, 2, guidance, 3)}))
    cols = [(1, 1, 24), (2, 2, 100)]
    return rows, cols


def build_settings_sheet(labels):
    resource_rows = [
        ("family", labels["resource_labels"]["family"]),
        ("scouting", labels["resource_labels"]["scouting"]),
        ("school", labels["resource_labels"]["school"]),
        ("energy", labels["resource_labels"]["energy"]),
    ]
    rows = [
        (1, {1: string_cell(1, 1, labels["settings_title"], 1)}),
        (3, {1: string_cell(3, 1, "resource", 2), 2: string_cell(3, 2, "meaning", 2), 3: string_cell(3, 3, "start", 2)}),
    ]
    for offset, (key, meaning) in enumerate(resource_rows, 4):
        rows.append((offset, {1: string_cell(offset, 1, key, 5), 2: string_cell(offset, 2, meaning, 3), 3: number_cell(offset, 3, 50, 4)}))
    rows.extend(
        [
            (10, {1: string_cell(10, 1, "effect_scale", 5), 2: string_cell(10, 2, "-3 to 3", 3), 3: string_cell(10, 3, "Game currently multiplies card effects by 8.", 3)}),
            (11, {1: string_cell(11, 1, "min_resource", 5), 2: number_cell(11, 2, 0, 4), 3: string_cell(11, 3, "Game over at 0.", 3)}),
            (12, {1: string_cell(12, 1, "max_resource", 5), 2: number_cell(12, 2, 100, 4), 3: string_cell(12, 3, "Resources are clamped at 100.", 3)}),
        ]
    )
    cols = [(1, 1, 24), (2, 2, 44), (3, 3, 46)]
    return rows, cols


def build_summary_sheet(labels):
    s = labels["summary_labels"]
    rows = [
        (1, {1: string_cell(1, 1, labels["summary_title"], 1)}),
        (3, {1: string_cell(3, 1, "Metric", 2), 2: string_cell(3, 2, "Value", 2), 3: string_cell(3, 3, "Check", 2)}),
        (4, {1: string_cell(4, 1, s["active"], 5), 2: formula_cell(4, 2, 'COUNTIF(Cards!N3:N102,"Active")', 4), 3: string_cell(4, 3, "These cards will be imported into the game.", 3)}),
        (5, {1: string_cell(5, 1, s["draft"], 5), 2: formula_cell(5, 2, 'COUNTIF(Cards!N3:N102,"Draft")', 4), 3: string_cell(5, 3, "Work in progress.", 3)}),
        (6, {1: string_cell(6, 1, s["inactive"], 5), 2: formula_cell(6, 2, 'COUNTIF(Cards!N3:N102,"Inactive")', 4), 3: string_cell(6, 3, "Parked rows.", 3)}),
        (7, {1: string_cell(7, 1, s["missing"], 5), 2: formula_cell(7, 2, 'COUNTBLANK(Cards!C3:C102)', 4), 3: string_cell(7, 3, "Blank template rows are expected.", 3)}),
        (8, {1: string_cell(8, 1, s["duplicates"], 5), 2: formula_cell(8, 2, 'COUNTA(Cards!A3:A102)-SUMPRODUCT((Cards!A3:A102<>"")/COUNTIF(Cards!A3:A102,Cards!A3:A102&""))', 4), 3: string_cell(8, 3, "Should be 0 before import.", 3)}),
    ]
    cols = [(1, 1, 30), (2, 2, 14), (3, 3, 70)]
    return rows, cols


def write_xlsx(output_path, sheets, title):
    sheet_names = [name for name, *_ in sheets]
    core, app = doc_props(sheet_names, title)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(output_path, "w", compression=zipfile.ZIP_DEFLATED) as zf:
        zf.writestr("[Content_Types].xml", content_types(len(sheets)))
        zf.writestr("_rels/.rels", package_rels())
        zf.writestr("docProps/core.xml", core)
        zf.writestr("docProps/app.xml", app)
        zf.writestr("xl/workbook.xml", workbook_xml(sheet_names))
        zf.writestr("xl/_rels/workbook.xml.rels", workbook_rels(len(sheets)))
        zf.writestr("xl/styles.xml", styles_xml())
        for idx, (name, rows, cols, freeze_row, auto_filter, validations) in enumerate(sheets, 1):
            zf.writestr(f"xl/worksheets/sheet{idx}.xml", sheet_xml(name, rows, cols, freeze_row, auto_filter, validations))
    print(output_path)


def build_workbook(locale, labels):
    cards = json.loads(labels["cards_path"].read_text(encoding="utf-8"))
    cards_rows, cards_cols, cards_validations = build_cards_sheet(cards, labels)
    instructions_rows, instructions_cols = build_instructions_sheet(labels)
    settings_rows, settings_cols = build_settings_sheet(labels)
    summary_rows, summary_cols = build_summary_sheet(labels)
    sheets = [
        ("Cards", cards_rows, cards_cols, 2, "A1:O102", cards_validations),
        ("Instructions" if locale == "en" else "Instrukcja", instructions_rows, instructions_cols, 3, None, None),
        ("Settings" if locale == "en" else "Ustawienia", settings_rows, settings_cols, 3, None, None),
        ("Summary" if locale == "en" else "Podsumowanie", summary_rows, summary_cols, 3, None, None),
    ]
    write_xlsx(labels["output"], sheets, labels["title"])


def main():
    for locale, labels in LOCALIZED.items():
        build_workbook(locale, labels)


if __name__ == "__main__":
    main()
