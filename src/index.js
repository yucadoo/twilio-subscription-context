import Storage from './storage';
import KeywordDetector from './keyword-detector';
import {
  DEFAULT_OPT_IN_KEYWORDS,
  DEFAULT_OPT_OUT_KEYWORDS,
  DEFAULT_HELP_KEYWORDS,
} from './constants';

export default class {
  constuctor(options) {
    let optInKeywords;
    if (options.YUCADOO_TSC_OPT_IN_KEYWORDS) {
      if (typeof options.YUCADOO_TSC_OPT_IN_KEYWORDS === 'string') {
        optInKeywords = options.YUCADOO_TSC_OPT_IN_KEYWORDS.split(',');
      } else if (
        options.YUCADOO_TSC_OPT_IN_KEYWORDS.constructor === Array ||
        options.YUCADOO_TSC_OPT_IN_KEYWORDS.every(item => typeof item === 'string')
      ) {
        throw new Error(
          'Comma-separated string or string array expected for YUCADOO_TSC_OPT_IN_KEYWORDS',
        );
      } else {
        optInKeywords = options.YUCADOO_TSC_OPT_IN_KEYWORDS;
      }
    } else if (options.YUCADOO_TSC_DEFAULT_KEYWORDS) {
      optInKeywords = DEFAULT_OPT_IN_KEYWORDS;
    } else {
      throw new Error(
        'Either provide custom comma-separated opt-in keywords using YUCADOO_TSC_OPT_IN_KEYWORDS or set the YUCADOO_TSC_DEFAULT_KEYWORDS flag',
      );
    }
    let optOutKeywords;
    if (options.YUCADOO_TSC_OPT_OUT_KEYWORDS) {
      if (typeof options.YUCADOO_TSC_OPT_OUT_KEYWORDS === 'string') {
        optOutKeywords = options.YUCADOO_TSC_OPT_OUT_KEYWORDS.split(',');
      } else if (
        options.YUCADOO_TSC_OPT_OUT_KEYWORDS.constructor === Array ||
        options.YUCADOO_TSC_OPT_OUT_KEYWORDS.every(item => typeof item === 'string')
      ) {
        throw new Error(
          'Comma-separated string or string array expected for YUCADOO_TSC_OPT_OUT_KEYWORDS',
        );
      } else {
        optOutKeywords = options.YUCADOO_TSC_OPT_OUT_KEYWORDS;
      }
    } else if (options.YUCADOO_TSC_DEFAULT_KEYWORDS) {
      optOutKeywords = DEFAULT_OPT_OUT_KEYWORDS;
    } else {
      throw new Error(
        'Either provide custom comma-separated opt-out keywords using YUCADOO_TSC_OPT_OUT_KEYWORDS or set the YUCADOO_TSC_DEFAULT_KEYWORDS flag',
      );
    }
    let helpKeywords;
    if (options.YUCADOO_TSC_HELP_KEYWORDS) {
      if (typeof options.YUCADOO_TSC_HELP_KEYWORDS === 'string') {
        helpKeywords = options.YUCADOO_TSC_HELP_KEYWORDS.split(',');
      } else if (
        options.YUCADOO_TSC_HELP_KEYWORDS.constructor === Array ||
        options.YUCADOO_TSC_HELP_KEYWORDS.every(item => typeof item === 'string')
      ) {
        throw new Error(
          'Comma-separated string or string array expected for YUCADOO_TSC_HELP_KEYWORDS',
        );
      } else {
        helpKeywords = options.YUCADOO_TSC_HELP_KEYWORDS;
      }
    } else if (options.YUCADOO_TSC_DEFAULT_KEYWORDS) {
      helpKeywords = DEFAULT_HELP_KEYWORDS;
    } else {
      throw new Error(
        'Either provide custom comma-separated help keywords using YUCADOO_TSC_HELP_KEYWORDS or set the YUCADOO_TSC_DEFAULT_KEYWORDS flag',
      );
    }
    if (!options.YUCADOO_TSC_SYNC_SERVICE_SID) {
      throw new Error('YUCADOO_TSC_SYNC_SERVICE_SID is required');
    }
    if (!options.YUCADOO_TSC_SYNC_MAP_SID) {
      throw new Error('YUCADOO_TSC_SYNC_MAP_SID is required');
    }
    this.optInKeywordDetector = new KeywordDetector(optInKeywords);
    this.optOutKeywordDetector = new KeywordDetector(optOutKeywords);
    this.helpKeywordDetector = new KeywordDetector(helpKeywords);

    this.storage = new Storage(
      options
        .getTwilioClient()
        .sync.services(options.YUCADOO_TSC_SYNC_SERVICE_SID)
        .syncMaps(options.YUCADOO_TSC_SYNC_MAP_SID),
    );
  }

  async handleIncomingMessageInstance(messageInstance) {
    let isSubscribed;
    let wasSubscribed;
    let isOptInKeyword = false;
    let isOptOutKeyword = false;
    let isHelpKeyword = false;
    const who = messageInstance.From;
    const content = messageInstance.Body;
    const eventId = messageInstance.MessageSid;
    if (eventId == null) {
      throw new Error(
        'handleIncomingMessageInstance is only for incoming messages, please use isSubscribed method instead',
      );
    }
    if (this.optInKeywordDetector.detect(content)) {
      isOptInKeyword = true;
      ({ isSubscribed, wasSubscribed } = await this.storage.setSubscriptionStatus(
        who,
        true,
        eventId,
      ));
    } else if (this.optOutKeywordDetector.detect(content)) {
      isOptOutKeyword = true;
      ({ isSubscribed, wasSubscribed } = await this.storage.setSubscriptionStatus(
        who,
        false,
        eventId,
      ));
    } else {
      isSubscribed = await this.storage.isSbuscribed(who);
      wasSubscribed = isSubscribed;
      isHelpKeyword = this.helpKeywordDetector.detect(content);
    }
    return {
      isSubscribed,
      wasSubscribed,
      optedIn: isSubscribed && !wasSubscribed,
      optedOut: wasSubscribed && !isSubscribed,
      isOptInKeyword,
      isOptOutKeyword,
      isHelpKeyword,
      isKeyword: isOptInKeyword || isOptOutKeyword || isHelpKeyword,
    };
  }

  /* eslint-disable-next-line unicorn/prevent-abbreviations */
  async isSubscribed(e164FormattedPhoneNumber) {
    return this.storage.isSbuscribed(e164FormattedPhoneNumber);
  }
}
