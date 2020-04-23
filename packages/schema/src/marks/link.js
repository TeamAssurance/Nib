const link = {
  attrs: {
    href: {}
  },
  inclusive: false,
  parseDOM: [
    {
      tag: "a[href]",
      getAttrs(dom) {
        return {
          href: dom.getAttribute("href")
        };
      }
    }
  ],
  toDOM(node) {
    return ["a", {...node.attrs, target: '_blank', rel: 'noopener noreferrer'}, 0];
  }
};

export default link;
