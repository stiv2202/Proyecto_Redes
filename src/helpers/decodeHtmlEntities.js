const decodeHtmlEntities = (str) => {
    return str.replace(/&quot;/g, '"')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>');
};

export default decodeHtmlEntities;