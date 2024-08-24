/* eslint-disable no-prototype-builtins */
export default function objectToXML (obj, rootElement = 'root') {
    let xml = `<${rootElement}>`;

    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
                xml += objectToXML(obj[key], key);
            } else {
                xml += `<${key}>${obj[key]}</${key}>`;
            }
        }
    }

    xml += `</${rootElement}>`;
    return xml;
}