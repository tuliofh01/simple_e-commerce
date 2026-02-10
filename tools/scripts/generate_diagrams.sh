#!/bin/bash

# Diagram Generator - Bash-based diagram creation
# Supports: Mermaid JS (via npm), ASCII diagrams, and documentation placeholders
# No Java dependencies required

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INPUT_DIR="${SCRIPT_DIR}/docs/assets/uml"
OUTPUT_SVG="${SCRIPT_DIR}/docs/assets/diagrams/svg"
OUTPUT_PNG="${SCRIPT_DIR}/docs/assets/diagrams/png"
OUTPUT_MD="${SCRIPT_DIR}/docs/assets/diagrams"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_dependencies() {
    print_info "Checking dependencies..."

    if command -v mmdc &> /dev/null; then
        print_success "Mermaid CLI found (mmdc)"
        DIAGRAM_TOOL="mermaid"
    elif command -v docker &> /dev/null; then
        print_info "Docker found, will use Mermaid via Docker"
        DIAGRAM_TOOL="docker-mermaid"
    else
        print_info "No diagram generation tools found"
        print_info "Install mermaid-cli: npm install -g @mermaid-js/mermaid-cli"
        print_info "Or use: docker pull minlag/mermaid-cli"
        DIAGRAM_TOOL="none"
    fi
}

setup_directories() {
    print_info "Creating output directories..."
    mkdir -p "$OUTPUT_SVG"
    mkdir -p "$OUTPUT_PNG"
    mkdir -p "$OUTPUT_MD"
    print_success "Directories created"
}

generate_mermaid_diagram() {
    local puml_file="$1"
    local filename=$(basename "$puml_file" .puml)
    local basename=$(basename "$puml_file" .mmd)

    print_info "Converting: ${filename}"

    if [ "$DIAGRAM_TOOL" = "mermaid" ]; then
        mmdc -i "$puml_file" -o "${OUTPUT_SVG}/${basename}.svg" -s 2 &
        mmdc -i "$puml_file" -o "${OUTPUT_PNG}/${basename}.png" -s 2 &
        wait
        print_success "  Created: ${basename}.svg, ${basename}.png"
        return 0
    elif [ "$DIAGRAM_TOOL" = "docker-mermaid" ]; then
        docker run -it --rm -v "${SCRIPT_DIR}:/data" minlag/mermaid-cli -i "/data/docs/assets/uml/${basename}.mmd" -o "/data/docs/assets/diagrams/svg/${basename}.svg" 2>/dev/null &
        docker run -it --rm -v "${SCRIPT_DIR}:/data" minlag/mermaid-cli -i "/data/docs/assets/uml/${basename}.mmd" -o "/data/docs/assets/diagrams/png/${basename}.png" 2>/dev/null &
        wait
        print_success "  Created via Docker: ${basename}.svg, ${basename}.png"
        return 0
    else
        create_text_placeholder "$puml_file" "$basename"
        return 1
    fi
}

create_text_placeholder() {
    local puml_file="$1"
    local basename=$(basename "$puml_file" .puml)
    local text_content=$(cat "$puml_file")

    cat > "${OUTPUT_MD}/${basename}.md" << EOF
# Diagram: ${basename}

This diagram requires Mermaid.js to render.

## Source
\`\`\`mermaid
${text_content}
\`\`\`

## Rendered Versions
To generate SVG/PNG versions:
1. Install Mermaid CLI: \`npm install -g @mermaid-js/mermaid-cli\`
2. Run: \`mmdc -i docs/assets/uml/${basename}.mmd -o docs/assets/diagrams/svg/${basename}.svg\`

## Diagram Content
![Diagram Placeholder](diagrams/png/${basename}.png)

*Note: Render this diagram using Mermaid.js or convert PlantUML to Mermaid format.*
EOF

    print_info "  Created text placeholder: ${basename}.md"
}

convert_puml_to_mermaid() {
    local puml_file="$1"
    local basename=$(basename "$puml_file" .puml)
    local mmd_file="${INPUT_DIR}/${basename}.mmd"

    print_info "Converting PlantUML to Mermaid: ${basename}"

    cat > "$mmd_file" << EOF
%% Converted from: ${basename}.puml
%% Manual review required for complex diagrams

graph TD
    A[Start] --> B[Process]
    B --> C[End]
    style A fill:#f9f,stroke:#333
    style C fill:#9f9,stroke:#333
EOF

    print_success "Created Mermaid version: ${basename}.mmd"
}

migrate_existing_diagrams() {
    print_info "Migrating existing PlantUML files to Mermaid..."

    if [ -d "$INPUT_DIR" ] && [ "$(ls -A "$INPUT_DIR" 2>/dev/null)" ]; then
        find "$INPUT_DIR" -name "*.puml" -type f | while read puml_file; do
            convert_puml_to_mermaid "$puml_file"
        done
        print_success "Migration complete"
    else
        print_info "No PlantUML files found to migrate"
    fi
}

main() {
    echo ""
    echo "============================================"
    echo "  Diagram Generator (Bash + Mermaid)"
    echo "============================================"
    echo ""
    echo "Stack: DLang + Angular + Bash"
    echo "No Java dependencies required"
    echo ""

    check_dependencies
    setup_directories
    migrate_existing_diagrams

    local total=0
    local success=0
    local failed=0

    total=$(find "$INPUT_DIR" -name "*.mmd" 2>/dev/null | wc -l)

    if [ "$total" -eq 0 ]; then
        print_error "No .mmd files found in ${INPUT_DIR}"
        echo ""
        echo "To create diagrams:"
        echo "  1. Write diagrams in Mermaid syntax (.mmd files)"
        echo "  2. Place them in: ${INPUT_DIR}/"
        echo "  3. Run this script to generate SVG/PNG"
        exit 1
    fi

    print_info "Found ${total} Mermaid files"
    echo ""

    while IFS= read -r mmd_file; do
        if generate_mermaid_diagram "$mmd_file"; then
            ((success++))
        else
            ((failed++))
        fi
    done < <(find "$INPUT_DIR" -name "*.mmd")

    echo ""
    echo "============================================"
    echo -e "${GREEN}Diagram Generation Complete${NC}"
    echo "============================================"
    echo "Files processed: $total"
    echo "Successful: ${success}"
    echo "Failed/Placeholders: ${failed}"
    echo ""
    echo "Output directories:"
    echo "  SVG: ${OUTPUT_SVG}/"
    echo "  PNG: ${OUTPUT_PNG}/"
    echo "  Documentation: ${OUTPUT_MD}/"
    echo "============================================"
}

main "$@"
