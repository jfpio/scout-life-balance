#!/usr/bin/env python3
import json
import os
import re
import zipfile
from datetime import datetime, timezone
from pathlib import Path
from xml.sax.saxutils import escape


ROOT = Path(__file__).resolve().parents[1]
CARDS_PATH = ROOT / "src" / "data" / "cards.json"
THREAD_ID = os.environ.get("CODEX_THREAD_ID", "manual")
OUTPUT_DIR = ROOT / "outputs" / THREAD_ID
OUTPUT_PATH = OUTPUT_DIR / "scout-life-balance-game-input-v1.xlsx"


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
    return (
        f"<c {' '.join(attrs)}><is><t>{escape(str(value), {'\"': '&quot;'})}</t></is></c>"
        if value is not None and value != ""
        else f"<c {' '.join(attrs)}/>"
    )


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
    row_blocks = []
    row_map = {r: row for r, row in rows}
    heights = {}
    if name == "Cards":
        heights = {1: 26, 2: 34}
        for r in range(3, min(max_row, 102) + 1):
            heights[r] = 54
    elif name == "Instructions":
        heights = {1: 28}
    elif name == "Summary":
        heights = {1: 28}
    elif name == "Settings":
        heights = {1: 28}

    for row_num in range(1, max_row + 1):
        row = row_map.get(row_num)
        if row:
            cells = [row[c] for c in sorted(row)]
            row_blocks.append(row_xml(row_num, cells, heights.get(row_num)))

    col_blocks = []
    for start, end, width in cols:
        col_blocks.append(f'<col min="{start}" max="{end}" width="{width}" customWidth="1"/>')

    views = ""
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
        f"<dimension ref=\"A1:{cell_ref(max_row, max_col)}\"/>"
        f"{views}<sheetFormatPr defaultRowHeight=\"15\"/>"
        f"<cols>{''.join(col_blocks)}</cols>"
        f"<sheetData>{''.join(row_blocks)}</sheetData>"
        f"{auto_filter_xml}{validation_xml}"
        "</worksheet>"
    )


def workbook_xml(sheet_names):
    sheets = []
    for idx, name in enumerate(sheet_names, 1):
        sheets.append(
            f'<sheet name="{escape(sanitize_sheet_name(name))}" sheetId="{idx}" r:id="rId{idx}"/>'
        )
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
  <fonts count="5">
    <font><sz val="11"/><name val="Calibri"/></font>
    <font><b/><sz val="16"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font>
    <font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font>
    <font><b/><sz val="11"/><color rgb="FF1F2937"/><name val="Calibri"/></font>
    <font><i/><sz val="10"/><color rgb="FF6B7280"/><name val="Calibri"/></font>
  </fonts>
  <fills count="7">
    <fill><patternFill patternType="none"/></fill>
    <fill><patternFill patternType="gray125"/></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FF355C7D"/><bgColor indexed="64"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FF4B7F52"/><bgColor indexed="64"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFF3F4F6"/><bgColor indexed="64"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFFFF7D6"/><bgColor indexed="64"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFE8F0FE"/><bgColor indexed="64"/></patternFill></fill>
  </fills>
  <borders count="2">
    <border><left/><right/><top/><bottom/><diagonal/></border>
    <border><left style="thin"><color rgb="FFD1D5DB"/></left><right style="thin"><color rgb="FFD1D5DB"/></right><top style="thin"><color rgb="FFD1D5DB"/></top><bottom style="thin"><color rgb="FFD1D5DB"/></bottom><diagonal/></border>
  </borders>
  <cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
  <cellXfs count="8">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
    <xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1"><alignment vertical="center"/></xf>
    <xf numFmtId="0" fontId="2" fillId="3" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="0" fillId="4" borderId="1" xfId="0" applyFill="1" applyBorder="1"><alignment vertical="top" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="0" fillId="5" borderId="1" xfId="0" applyFill="1" applyBorder="1"><alignment horizontal="center" vertical="center"/></xf>
    <xf numFmtId="0" fontId="3" fillId="6" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1"><alignment vertical="center" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="4" fillId="0" borderId="0" xfId="0" applyFont="1"><alignment vertical="top" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1"><alignment vertical="center"/></xf>
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


def doc_props(sheet_names):
    now = datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")
    app = (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" '
        'xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">'
        "<Application>Codex</Application><DocSecurity>0</DocSecurity><ScaleCrop>false</ScaleCrop>"
        f"<HeadingPairs><vt:vector size=\"2\" baseType=\"variant\"><vt:variant><vt:lpstr>Worksheets</vt:lpstr></vt:variant><vt:variant><vt:i4>{len(sheet_names)}</vt:i4></vt:variant></vt:vector></HeadingPairs>"
        f"<TitlesOfParts><vt:vector size=\"{len(sheet_names)}\" baseType=\"lpstr\">"
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
        "<dc:title>Scout Life Balance - Game Input v1</dc:title>"
        "<dc:creator>Codex</dc:creator>"
        f'<dcterms:created xsi:type="dcterms:W3CDTF">{now}</dcterms:created>'
        f'<dcterms:modified xsi:type="dcterms:W3CDTF">{now}</dcterms:modified>'
        "</cp:coreProperties>"
    )
    return core, app


def build_cards_sheet(cards):
    headers = [
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
    rows = []
    title = {1: string_cell(1, 1, "Scout Life Balance - editable game input", 1)}
    rows.append((1, title))
    header_row = {idx: string_cell(2, idx, header, 2) for idx, header in enumerate(headers, 1)}
    rows.append((2, header_row))

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
                "Imported from current cards.json",
            ]
        else:
            next_id = ""
            values = [next_id, "", "", "", 0, 0, 0, 0, "", 0, 0, 0, 0, "Draft", ""]

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
        '<dataValidation type="whole" operator="between" allowBlank="1" showErrorMessage="1" errorTitle="Use small whole numbers" error="Use a whole number from -3 to 3. The app multiplies this by the difficulty scale." sqref="E3:H102 J3:M102"><formula1>-3</formula1><formula2>3</formula2></dataValidation>',
        '<dataValidation type="list" allowBlank="0" showErrorMessage="1" errorTitle="Choose a status" error="Use Active, Draft, or Inactive." sqref="N3:N102"><formula1>"Active,Draft,Inactive"</formula1></dataValidation>',
    ]
    cols = [
        (1, 1, 10),
        (2, 2, 8),
        (3, 3, 58),
        (4, 4, 34),
        (5, 8, 12),
        (9, 9, 34),
        (10, 13, 12),
        (14, 14, 12),
        (15, 15, 28),
    ]
    return rows, cols, validations


def build_instructions_sheet():
    lines = [
        ("Purpose", "Edit the Cards tab. Each row is one game card and each card has exactly two choices."),
        ("Status", "Use Active for cards that should appear in the game. Draft and Inactive can stay in the sheet without being used."),
        ("Effects", "Use small whole numbers from -3 to 3. Positive numbers increase a resource; negative numbers decrease it."),
        ("Resources", "family = friends/family/social life, scouting = scout unit, school = school/studies, energy = health/rest."),
        ("Difficulty", "The current game multiplies each effect by the difficulty scale from Settings. A value of -2 means -16 with scale 8."),
        ("IDs", "Keep card_id unique. Use the next free number when adding a new card."),
        ("Scenario text", "Write the situation shown to the player. Keep it short enough for a swipe card."),
        ("Choice text", "Write the label shown on the left or right decision button/card."),
        ("Google Sheets", "This workbook is designed so it can be imported to Google Sheets and later read by the game."),
    ]
    rows = [(1, {1: string_cell(1, 1, "How non-technical editors should use this file", 1)})]
    rows.append((3, {1: string_cell(3, 1, "Topic", 2), 2: string_cell(3, 2, "Guidance", 2)}))
    for idx, (topic, guidance) in enumerate(lines, 4):
        rows.append((idx, {1: string_cell(idx, 1, topic, 5), 2: string_cell(idx, 2, guidance, 3)}))
    cols = [(1, 1, 22), (2, 2, 96)]
    return rows, cols


def build_settings_sheet():
    rows = [
        (1, {1: string_cell(1, 1, "Game settings", 1)}),
        (3, {1: string_cell(3, 1, "setting_key", 2), 2: string_cell(3, 2, "value", 2), 3: string_cell(3, 3, "notes", 2)}),
        (4, {1: string_cell(4, 1, "initial_family", 5), 2: number_cell(4, 2, 50, 4), 3: string_cell(4, 3, "Current game starts each resource at 50.", 3)}),
        (5, {1: string_cell(5, 1, "initial_scouting", 5), 2: number_cell(5, 2, 50, 4), 3: string_cell(5, 3, "Current game starts each resource at 50.", 3)}),
        (6, {1: string_cell(6, 1, "initial_school", 5), 2: number_cell(6, 2, 50, 4), 3: string_cell(6, 3, "Current game starts each resource at 50.", 3)}),
        (7, {1: string_cell(7, 1, "initial_energy", 5), 2: number_cell(7, 2, 50, 4), 3: string_cell(7, 3, "Current game starts each resource at 50.", 3)}),
        (8, {1: string_cell(8, 1, "difficulty_scale", 5), 2: number_cell(8, 2, 8, 4), 3: string_cell(8, 3, "The current code uses DIFFICULTY_SCALE = 8.", 3)}),
        (9, {1: string_cell(9, 1, "min_resource", 5), 2: number_cell(9, 2, 0, 4), 3: string_cell(9, 3, "Game over when a resource reaches 0.", 3)}),
        (10, {1: string_cell(10, 1, "max_resource", 5), 2: number_cell(10, 2, 100, 4), 3: string_cell(10, 3, "Resources are clamped to 100.", 3)}),
    ]
    cols = [(1, 1, 24), (2, 2, 12), (3, 3, 70)]
    validations = [
        '<dataValidation type="whole" operator="between" allowBlank="0" showErrorMessage="1" sqref="B4:B10"><formula1>0</formula1><formula2>100</formula2></dataValidation>'
    ]
    return rows, cols, validations


def build_summary_sheet():
    rows = [
        (1, {1: string_cell(1, 1, "Input summary and quick checks", 1)}),
        (3, {1: string_cell(3, 1, "Metric", 2), 2: string_cell(3, 2, "Value", 2), 3: string_cell(3, 3, "What to check", 2)}),
        (4, {1: string_cell(4, 1, "Active cards", 5), 2: formula_cell(4, 2, 'COUNTIF(Cards!N3:N102,"Active")', 4), 3: string_cell(4, 3, "Cards currently intended to appear in the game.", 3)}),
        (5, {1: string_cell(5, 1, "Draft cards", 5), 2: formula_cell(5, 2, 'COUNTIF(Cards!N3:N102,"Draft")', 4), 3: string_cell(5, 3, "Rows being worked on.", 3)}),
        (6, {1: string_cell(6, 1, "Inactive cards", 5), 2: formula_cell(6, 2, 'COUNTIF(Cards!N3:N102,"Inactive")', 4), 3: string_cell(6, 3, "Rows intentionally parked.", 3)}),
        (7, {1: string_cell(7, 1, "Missing scenario text", 5), 2: formula_cell(7, 2, 'COUNTBLANK(Cards!C3:C102)', 4), 3: string_cell(7, 3, "Blank template rows are expected here.", 3)}),
        (8, {1: string_cell(8, 1, "Duplicate IDs check", 5), 2: formula_cell(8, 2, 'COUNTA(Cards!A3:A102)-SUMPRODUCT((Cards!A3:A102<>"")/COUNTIF(Cards!A3:A102,Cards!A3:A102&""))', 4), 3: string_cell(8, 3, "Should be 0 before import.", 3)}),
        (10, {1: string_cell(10, 1, "Effect scale note", 6), 2: string_cell(10, 2, "Values in Cards are design-scale values. The game currently multiplies them by 8.", 6)}),
    ]
    cols = [(1, 1, 28), (2, 2, 14), (3, 3, 72)]
    return rows, cols


def write_xlsx(sheets):
    sheet_names = [name for name, *_ in sheets]
    core, app = doc_props(sheet_names)
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(OUTPUT_PATH, "w", compression=zipfile.ZIP_DEFLATED) as zf:
        zf.writestr("[Content_Types].xml", content_types(len(sheets)))
        zf.writestr("_rels/.rels", package_rels())
        zf.writestr("docProps/core.xml", core)
        zf.writestr("docProps/app.xml", app)
        zf.writestr("xl/workbook.xml", workbook_xml(sheet_names))
        zf.writestr("xl/_rels/workbook.xml.rels", workbook_rels(len(sheets)))
        zf.writestr("xl/styles.xml", styles_xml())
        for idx, (name, rows, cols, freeze_row, auto_filter, validations) in enumerate(sheets, 1):
            zf.writestr(
                f"xl/worksheets/sheet{idx}.xml",
                sheet_xml(name, rows, cols, freeze_row, auto_filter, validations),
            )
    print(OUTPUT_PATH)


def main():
    cards = json.loads(CARDS_PATH.read_text(encoding="utf-8"))
    cards_rows, cards_cols, cards_validations = build_cards_sheet(cards)
    instructions_rows, instructions_cols = build_instructions_sheet()
    settings_rows, settings_cols, settings_validations = build_settings_sheet()
    summary_rows, summary_cols = build_summary_sheet()
    sheets = [
        ("Instructions", instructions_rows, instructions_cols, 3, None, None),
        ("Cards", cards_rows, cards_cols, 2, "A2:O102", cards_validations),
        ("Settings", settings_rows, settings_cols, 3, None, settings_validations),
        ("Summary", summary_rows, summary_cols, 3, None, None),
    ]
    write_xlsx(sheets)


if __name__ == "__main__":
    main()
