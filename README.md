# App Setup Events Samples

App setup events are events that occur when an app is installed from the Freshworks Marketplace or updated to the latest version or uninstalled. These are asynchronous events and developers can enable their apps to decide if the event should reach completion or perform various tasks based on the event.

For Example: If a webhook has to be registered during app installation, you can use the app setup event to disallow installation if the webhook registration fails. You can configure event listeners in the `manifest.json` file. 

When an app setup event occurs, the corresponding event listener invokes a callback method defined in server.js and passes a standard payload to the method.

### Prerequisites:

1. Make sure you have a trial Freshdesk account created. You can always [sign up](https://freshdesk.com/signup)
2. Ensure that you have the [Freshworks CLI](https://community.developers.freshworks.com/t/what-are-the-prerequisites-to-install-the-freshworks-cli/234) installed properly.

### afterAppUpdate

After you upload a new version of your app, in the Apps gallery > MANAGE APPS an Update button is displayed next to the app (for admin users). If the admin clicks the button and updates the app, the new app version is installed and the `afterAppUpdate` event is triggered.

The sample code under this example demonstrates the use of `afterAppUpdate` app setup event. This hook can be used to tie the logic when users manually update their app on the Freshworks Marketplace.

> **Note**
> If your app contains the afterAppUpdate event, app users are not automatically moved to the latest app version after it is available. The app users must click the Update button and manually upgrade.

#### How to setup

Register the afterAppUpdate event by using the following sample `manifest.json` content:

```
"events": {
    "afterAppUpdate": {
        "handler": "afterAppUpdateCallback"
    }
}
```

Define the corresponding callback that does not interrupt usage of the updated app, by using the following sample `server.js` content:

```
exports = {
    afterAppUpdateCallback: function(payload) {
        console.log("Logging arguments from afterAppUpdate event: " + JSON.stringify(payload));
        // To continue usage of the updated app.
        renderData();
    }
}
```

Define the corresponding callback that reverts the app to the earlier installed version if a mandatory action fails, by using the following sample `server.js` content:

```
exports = {
    afterAppUpdateCallback: function(payload) {
        console.log("Logging arguments from afterAppUpdate event: " + JSON.stringify(payload));
        // To revert to earlier installed app version.
        renderData({message: "Updating to the latest version of the app failed due to network error."});
    }
}
```

Sample Application: [Click Here](https://github.com/freshworks-developers/app-setup-events-samples/tree/main/afterAppUpdate)

Official Documentation: [Click Here](https://developers.freshdesk.com/v2/docs/app-setup-events/#afterappupdate)
