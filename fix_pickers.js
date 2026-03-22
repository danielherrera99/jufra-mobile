const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src/screens');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.js'));

files.forEach(file => {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    // Remove any previous color injections if any (just in case)
    content = content.replace(/ color="#1A1A1A"/g, '');
    content = content.replace(/ dropdownIconColor="#424242"/g, '');

    // Add color to Picker.Item
    if (content.includes('<Picker.Item')) {
        content = content.replace(/<Picker\.Item /g, '<Picker.Item color="#1A1A1A" ');
        changed = true;
    }

    // Add dropdownIconColor to Picker
    if (content.includes('<Picker') && !content.includes('<Picker.Item')) {
        // Just in case, handled above
    }
    
    // Safety matching for Picker
    content = content.replace(/<Picker(?!\.)([^>]*)>/g, (match, p1) => {
        let inside = p1;
        // if no dropdownIconColor, add it
        if (!inside.includes('dropdownIconColor')) {
            inside += ' dropdownIconColor="#424242"';
        }
        
        // Handle style attribute
        if (inside.includes('style=')) {
            // merge color into existing style
            // extract the style
            inside = inside.replace(/style=\{([^}]*?)\}/, (matchStyle, innerStyle) => {
                if(innerStyle.includes('color:')) return matchStyle;
                return `style={[${innerStyle}, { color: "#1A1A1A" }]}`;
            });
        } else {
            // add style
            inside += ' style={{ color: "#1A1A1A" }}';
        }

        return `<Picker${inside}>`;
    });
    
    // Check if the modified content is different
    const ogContent = fs.readFileSync(filePath, 'utf8');
    if (content !== ogContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${file}`);
    }
});
