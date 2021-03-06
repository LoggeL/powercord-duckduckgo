const { Plugin } = require("powercord/entities");
const { findInReactTree } = require("powercord/util");
const { getModule, React } = require("powercord/webpack");
const { inject, uninject } = require("powercord/injector");

module.exports = class DuckDuckGoSearch extends Plugin {
  async startPlugin() {
    const Menu = await getModule(["MenuItem"]);
    const { MenuItem, MenuGroup } = Menu;

    const MessageContextMenu = await getModule(
      (m) => m.default && m.default.displayName === "MessageContextMenu"
    );

    inject(
      "logge-ddg-search",
      MessageContextMenu,
      "default",
       (args, res) => {
        res.props.children = res.props.children.filter(
          (v) => v.props.children?.[0]?.props?.id != "search-google"
        );

        if (
          !findInReactTree(
            res,
            (c) => c.props && c.props.id === "logge-ddg-search"
          ) &&
          args[0].target.tagName.toLowerCase() == "div" &&
          args[0].target.classList.contains("markup-2BOw-j") &&
          args[0].target.classList.contains("messageContent-2qWWxC")
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
      }
    );

    MessageContextMenu.default.displayName = "MessageContextMenu";

    powercord.api.commands.registerCommand({
      command: "ddg",
      description: "Sends a ddg link.",
      usage: "{c} [ ...arguments ]",
      executor: (args) => ({
        send: true,
        result: "https://ddg.gg/" + encodeURIComponent(args.join(" ")),
      }),
    });
  }

  pluginWillUnload() {
    uninject("logge-ddg-search");

    powercord.api.commands.unregisterCommand("ddg");
  }
};

// Inspired by With Mask and Juby210
//Logge gay btw
