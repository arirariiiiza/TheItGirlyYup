// index.js
// The main script file for TheItGirlyYup extension

// Import any needed resources from SillyTavern
import { 
  getContext, 
  doExtrasFetch, 
  getApiUrl 
} from "../../extensions.js";

import {
  SlashCommandParser,
  SlashCommand,
  SlashCommandArgument,
  SlashCommandNamedArgument,
  ARGUMENT_TYPE
} from "../../slash-commands.js";

// Print a log to confirm extension is loaded
console.log("[TheItGirlyYup] Extension loaded!");

// (Optional) Access SillyTavern context if needed
const context = getContext(); 
// e.g. context.chat, context.characters, etc.

// 1) Example: Basic fetch() to an external endpoint
async function doBasicFetch(endpointUrl) {
  try {
    const response = await fetch(endpointUrl, {
      method: "GET" // or "PUT", "POST", etc.
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("[TheItGirlyYup] Basic fetch error:", error);
    return { error: error.message };
  }
}

// 2) Example: Using doExtrasFetch() through SillyTavern’s Extras server
async function doExtrasPUTRequest(pathname, bodyData) {
  // Build the Extras API URL
  const url = new URL(getApiUrl());
  url.pathname = pathname; // e.g. "/api/my-endpoint"

  try {
    const result = await doExtrasFetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(bodyData)
    });
    return result;
  } catch (error) {
    console.error("[TheItGirlyYup] Extras PUT error:", error);
    return { error: error.message };
  }
}

// Register a slash command to demonstrate how to call these functions from chat
SlashCommandParser.addCommandObject(
  SlashCommand.fromProps({
    name: "theItGirlyFetch",
    aliases: ["itgfetch"], // optional shorter alias
    callback: async (namedArgs, unnamedArgs) => {
      /*
        Example usage in chat:
        /theItGirlyFetch mode=basic url=https://api.github.com/users/octocat
        or
        /theItGirlyFetch mode=extras path=/api/someRoute body={"msg":"Hello"}
      */

      // Read named arguments
      const mode = namedArgs.mode?.toString() || "basic";
      const url = namedArgs.url?.toString() || "";
      const path = namedArgs.path?.toString() || "";
      const body = namedArgs.body ? JSON.parse(namedArgs.body) : {};

      if (mode === "basic") {
        if (!url) {
          return "Error: No 'url' provided for basic fetch";
        }
        const data = await doBasicFetch(url);
        return JSON.stringify(data, null, 2);
      } else if (mode === "extras") {
        if (!path) {
          return "Error: No 'path' provided for extras PUT request";
        }
        const data = await doExtrasPUTRequest(path, body);
        return JSON.stringify(data, null, 2);
      }

      return "Usage: /theItGirlyFetch mode=(basic|extras) [url=] [path=] [body=]";
    },
    namedArgumentList: [
      SlashCommandNamedArgument.fromProps({
        name: "mode",
        description: "Set fetch mode: 'basic' or 'extras'",
        typeList: [ARGUMENT_TYPE.STRING],
        defaultValue: "basic"
      }),
      SlashCommandNamedArgument.fromProps({
        name: "url",
        description: "URL for basic fetch (GET/PUT/POST)",
        typeList: [ARGUMENT_TYPE.STRING]
      }),
      SlashCommandNamedArgument.fromProps({
        name: "path",
        description: "Relative path for extras fetch",
        typeList: [ARGUMENT_TYPE.STRING]
      }),
      SlashCommandNamedArgument.fromProps({
        name: "body",
        description: "JSON string for extras body data",
        typeList: [ARGUMENT_TYPE.STRING]
      })
    ],
    // The user’s unnamed arguments (the part after all named arguments) 
    // but we won't use it in this example
    unnamedArgumentList: [
      SlashCommandArgument.fromProps({
        description: "Unused text argument",
        typeList: [ARGUMENT_TYPE.STRING],
        isRequired: false
      })
    ],
    returns: "JSON string result from the fetch call",
    helpString: `
      <div>
        <strong>theItGirlyFetch Command:</strong>
        <ul>
          <li><code>/theItGirlyFetch mode=basic url=https://api.github.com/users/octocat</code></li>
          <li><code>/theItGirlyFetch mode=extras path=/api/test body={"msg":"Hello"}</code></li>
        </ul>
      </div>
    `
  })
);

console.log("[TheItGirlyYup] Slash command /theItGirlyFetch registered.");
