const { Plugin } = require("powercord/entities");
const { findInReactTree } = require("powercord/util");
const { getModule, React } = require("powercord/webpack");
const { inject, uninject } = require("powercord/injector");

module.exports = class DuckDuckGoSearch extends Plugin {
  async startPlugin() {
    const Menu = await getModule(["MenuItem"]);
    const { MenuItem, MenuGroup } = Menu;
    console.log(MenuItem);
    const MessageContextMenu = await getModule(
      (m) => m.default && m.default.displayName === "MessageContextMenu"
    );

    inject("logge-ddg-search", MessageContextMenu, "default", (args, res) => {
      res.props.children = res.props.children.filter(
        (v) => v.props.children?.[0]?.props?.id != "search-google"
      );

      if (
        !findInReactTree(
          res,
          (c) => c.props && c.props.id === "logge-ddg-search"
        )
      ) {
        res.props.children.splice(
          1,
          0,
          React.createElement(
            MenuGroup,
            null,
            React.createElement(MenuItem, {
              action: () => {
                let markedText = window.getSelection().toString();
                if (!markedText) {
                  markedText = args[0].message.content;
                }

                require("electron").shell.openExternal(
                  `https://ddg.gg/${encodeURIComponent(markedText)}`
                );
              },
              id: "logge-ddg-search",
              label: "Search with DDG",
            })
          )
        );
      }

      return res;
    });
    MessageContextMenu.default.displayName = "MessageContextMenu";
  }

  pluginWillUnload() {
    uninject("logge-ddg-search");
  }
};

// Inspired by With Mask and Juby210
