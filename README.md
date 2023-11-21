# Twilio Subscription Context

[![Latest Stable Version](https://img.shields.io/npm/v/twilio-subscription-context.svg)](https://www.npmjs.com/package/twilio-subscription-context)
[![NPM Downloads](https://img.shields.io/npm/dm/twilio-subscription-context.svg)](https://www.npmjs.com/package/twilio-subscription-context)

Tracks opt-in and opt-out in Twilio Serverless.

## Background

As Twilio points out in this [blog post](https://www.twilio.com/blog/store-opt-out-data-twilio-functions-sync) Twilio does not yet provide an API to retrieve opt-out data.

This imposes a challenge in [Serverless](https://www.twilio.com/en-us/serverless) development since even the simplest [Studio](https://www.twilio.com/en-us/serverless/studio) Flows and [Functions](https://www.twilio.com/en-us/serverless/functions), like the [autoresponser](https://www.twilio.com/docs/studio/tutorials/how-to-set-up-auto-responder), run into errors due to opt-outs.

The above mentioned blog post provides a guideline how to solve the problem. This package provides a reusable solution based on the blog post. It's usage is demonstrated on the autoresponser example.

## Installation

Assuming you already have a serverless project with Functions that you can deploy to your Twilio account, add this package as a dependency.

```bash
npm install twilio-subscription-context
```
If you haven't used Sync Maps so far, please follow the Sync setup section of the blog post.

If you don't have a project at all, follow the Tutorial prerequisites, Sync setup, Developer Environment Setup and Create project of the [blog post](https://www.twilio.com/blog/store-opt-out-data-twilio-functions-sync).

## Configure environment

The naming of environment variables is slightly different than in the original blog post, to avoid potential naming conficts.
```bash
ACCOUNT_SID=<Twilio Account SID>
AUTH_TOKEN=<Twilio Auth Token>
YUCADOO_TSC_SYNC_SERVICE_SID=<Sync Service SID>
YUCADOO_TSC_SYNC_MAP_SID=<Sync Map SID>
YUCADOO_TSC_DEFAULT_KEYWORDS=true
```

Notice the `YUCADOO_TSC_DEFAULT_KEYWORDS` variables. Since it's possible to customize the keywords for opt-in, opt-out and help using [Advanced Opt-Out](https://www.twilio.com/docs/messaging/services/tutorials/advanced-opt-out), the custom keywords can be passed as a comma-separated string in additional environment variables as shown below.
```bash
YUCADOO_TSC_OPT_IN_KEYWORDS=subscribe
YUCADOO_TSC_OPT_OUT_KEYWORDS=unsubscribe,halt
YUCADOO_TSC_HELP_KEYWORDS=what
```
If `YUCADOO_TSC_DEFAULT_KEYWORDS` and one of the variables for custom keywords are set at the same time, the custom keywords will be used. If both are missing, an error is raised.

## Usage

The `SubscriptionContext` is the default class from the package. Initialize it by passing the Twilio context as only parameter. The context contains all the environment varialbes for it to work.

```js
import SubscriptionContext from 'twilio-subscription-context';

exports.handler = async (context, event, callback) => {
  const subscriptionContext = new SubscriptionContext(context);
  // use subscriptionContext
};
```
For every incoming SMS message invoke the `handleIncomingMessageInstance` function by passing the `event` into it. This method needs to be invoked to update the subscription data.
It returns an object with a variaty of flags.
`handleIncomingMessageInstance` is idempotent. It may be invoked multiple times with the same event. Subsequent invocations won't change the data, but will return the same `subscriptionResult`.
```js
import SubscriptionContext from 'twilio-subscription-context';

exports.handler = async (context, event, callback) => {
  const subscriptionContext = new SubscriptionContext(context);
  const subscriptionResult = await subscriptionContext.handleIncomingMessageInstance(event);
  // true if customer is opted in after handling message
  // for example 'START' message and messages following it
  console.log('isSubscribed: ' + subscriptionResult.isSubscribed);
  // true if customer was opted in before handling message
  // for example when receiving 'START' message for the first time
  console.log('wasSubscribed: ' + subscriptionResult.wasSubscribed);
  // true if customer just changed from opted out to opted in
  // will be false if a second 'START' message is received or 'START' without previous 'STOP'
  console.log('optedIn: ' + subscriptionResult.optedIn);
  // true if customer just changed from opted in to opted out
  // will be false if a second 'STOP' message is received without 'START' between
  console.log('optedOut: ' + subscriptionResult.optedOut);
  // true if message is an opt-in keyword
  // for example 'START'
  console.log('isOptInKeyword: ' + subscriptionResult.isOptInKeyword);
  // true if message is an opt-out keyword
  // for example 'STOP'
  console.log('isOptOutKeyword: ' + subscriptionResult.isOptOutKeyword);
  // true if message is a help keyword
  // for example 'HELP'
  console.log('isHelpKeyword: ' + subscriptionResult.isHelpKeyword);
  // true if message is a keyword
  // for example 'START' or 'STOP' or 'HELP'
  console.log('isKeyword: ' + subscriptionResult.isKeyword);
};
```
If the event isn't an incoming SMS message use `isSubscribed` with the E164 formatted phone number to determine if the phone number is opted in.
```js
import SubscriptionContext from 'twilio-subscription-context';

exports.handler = async (context, event, callback) => {
  const subscriptionContext = new SubscriptionContext(context);
  if (await subscriptionContext.isSubscribed('+15551231234')) {
    // send message to '+15551231234' with confidence
  }
};
```
### Example Function for Flow

To access the subscription context in Studio Flows, the function widged needs to be used.
The subscription result contains a variaty of flags, but in my experience the flow should only proceed if the customer is subscribed and it's not a keyword.
```js
import SubscriptionContext from 'twilio-subscription-context';

exports.handler = async (context, event, callback) => {
  try {
    const subscriptionContext = new SubscriptionContext(context);
    const subscriptionResult = await subscriptionContext.handleIncomingMessageInstance(event);
    let responseContent;
    if (subscriptionResult.isKeyword) {
      responseContent = 'Keyword';
    } else if (subscriptionResult.isSubscribed) {
      responseContent = 'Subscribed';
    } else {
      responseContent = 'Unsubscribed';
    }
    return callback(null, responseContent);
  } catch (error) {
    return callback(error, null);
  }
};
```

## Contributing

Please refer to the [guidelines for contributing](./CONTRIBUTING.md).

## License

[![License](https://img.shields.io/npm/l/twilio-subscription-context.svg)](LICENSE.md)
