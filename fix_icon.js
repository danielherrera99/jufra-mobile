const Jimp = require('jimp');

async function fixIcon() {
    try {
        console.log('Leyendo logo original...');
        const original = await Jimp.read('./assets/icon.png');
        
        // Crear un lienzo nuevo de 1080x1080 totalmente transparente
        const background = new Jimp(1080, 1080, 0x00000000); 
        
        // Reducir el logo original a 700x700 (el "safe zone" que pide Android)
        original.scaleToFit(700, 700);
        
        // Calcular el centro exacto
        const x = (1080 - original.bitmap.width) / 2;
        const y = (1080 - original.bitmap.height) / 2;
        
        // Pegar el logo reducido en el centro del lienzo gigante
        background.composite(original, x, y);
        
        // Sobrescribir el adaptive-icon.png
        await background.writeAsync('./assets/adaptive-icon.png');
        console.log('¡Icono adaptativo creado con exito!');
    } catch (err) {
        console.error('Error procesando imagen:', err);
    }
}

fixIcon();
