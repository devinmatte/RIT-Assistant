'use strict';

process.env.DEBUG = 'actions-on-google:*';
const App = require('actions-on-google').ApiAiApp;

// API.AI actions
const UNRECOGNIZED_DEEP_LINK = 'deeplink.unknown';
const TELL_FACT = 'tell.fact';

// API.AI parameter names
const CATEGORY_ARGUMENT = 'category';

// API.AI Contexts/lifespans
const FACTS_CONTEXT = 'choose_fact-followup';
const DEFAULT_LIFESPAN = 5;
const END_LIFESPAN = 0;

const INFORMATION_TYPE = {
    HISTORY: 'history',
    MAJORS: 'majors'
};

const HISTORY_FACTS = new Set([
    'FOUNDED IN 1829, Rochester Institute of Technology is a privately endowed, coeducational university with nine colleges emphasizing career education and experiential learning.',
    'THE CAMPUS occupies 1,300 acres in suburban Rochester, the third-largest city in New York state. RIT also has international locations in China, Croatia, Dubai, and Kosovo. ',
]);

const RIT_IMAGES = [
    [
        'http://www.rit.edu/upub/sites/rit.edu.upub/files/logos/tiger_walking_rit_color.jpg',
        'RIT Tiger Logo'
    ]
];

const LINK_OUT_TEXT = 'Learn more';
const RIT_LINK = 'https://www.rit.edu/overview/rit-in-brief';
const NEXT_FACT_DIRECTIVE = ' Would you like to hear another fact?';
const CONFIRMATION_SUGGESTIONS = ['Sure', 'No thanks'];

const NO_INPUTS = [
    'I didn\'t hear that.',
    'If you\'re still there, say that again.',
    'We can stop here. See you soon.'
];

function getRandomImage(images) {
    let randomIndex = Math.floor(Math.random() * images.length);
    return images[randomIndex];
}

function getRandomFact(facts) {
    if (facts.size <= 0) {
        return null;
    }
    let randomIndex = (Math.random() * (facts.size - 1)).toFixed();
    let randomFactIndex = parseInt(randomIndex, 10);
    let counter = 0;
    let randomFact = '';
    for (let fact of facts.values()) {
        if (counter === randomFactIndex) {
            randomFact = fact;
            break;
        }
        counter++;
    }
    facts.delete(randomFact);
    return randomFact;
}

exports.RITAssistant = (request, response) => {
    const app = new App({request, response});
    console.log('Request headers: ' + JSON.stringify(request.headers));
    console.log('Request body: ' + JSON.stringify(request.body));

    // Greet the user and direct them to next turn
    function unhandledDeepLinks(app) {
        if (app.hasSurfaceCapability(app.SurfaceCapabilities.SCREEN_OUTPUT)) {
            app.ask(app.buildRichResponse()
                .addSimpleResponse(`Welcome to R.I.T Assistant! I'd really rather \
not talk about ${app.getRawInput()}. What do you want to know about R.I.T?`)
                .addSuggestions(['Trivia', 'Majors']), NO_INPUTS);
        } else {
            app.ask(`Welcome to R.I.T Assistant! I'd really rather \
not talk about ${app.getRawInput()}. \
What do you want to know about R.I.T?`,
                NO_INPUTS);
        }
    }

    // Say a fact
    function tellFact(app) {
        let historyFacts = app.data.historyFacts
            ? new Set(app.data.historyFacts) : HISTORY_FACTS;

        let factCategory = app.getArgument(CATEGORY_ARGUMENT);

        if (factCategory === INFORMATION_TYPE.HISTORY) {
            let fact = getRandomFact(historyFacts);
            if (fact === null) {
                if (app.hasSurfaceCapability(app.SurfaceCapabilities.SCREEN_OUTPUT)) {
                    let suggestions = ['Majors'];
                    app.ask(app.buildRichResponse()
                        .addSimpleResponse(noFactsLeft(app, factCategory, INFORMATION_TYPE.MAJORS))
                        .addSuggestions(suggestions), NO_INPUTS);
                } else {
                    app.ask(noFactsLeft(app, factCategory, INFORMATION_TYPE.MAJORS),
                        NO_INPUTS);
                }
                return;
            }

            let factPrefix = 'Sure, here\'s a trivia fact. ';
            app.data.historyFacts = Array.from(historyFacts);
            if (app.hasSurfaceCapability(app.SurfaceCapabilities.SCREEN_OUTPUT)) {
                let image = getRandomImage(RIT_IMAGES);
                app.ask(app.buildRichResponse()
                    .addSimpleResponse(factPrefix)
                    .addBasicCard(app.buildBasicCard(fact)
                        .addButton(LINK_OUT_TEXT, RIT_LINK)
                        .setImage(image[0], image[1]))
                    .addSimpleResponse(NEXT_FACT_DIRECTIVE)
                    .addSuggestions(CONFIRMATION_SUGGESTIONS), NO_INPUTS);
            } else {
                app.ask(factPrefix + fact + NEXT_FACT_DIRECTIVE, NO_INPUTS);
            }
            return;
        } else if (factCategory === INFORMATION_TYPE.MAJORS) {

        } else {
            // Conversation repair is handled in API.AI, but this is a safeguard
            if (app.hasSurfaceCapability(app.SurfaceCapabilities.SCREEN_OUTPUT)) {
                app.ask(app.buildRichResponse()
                    .addSimpleResponse(`Sorry, I didn't understand. What do you want to know about R.I.T?`)
                    .addSuggestions(['Trivia', 'Majors']), NO_INPUTS);
            } else {
                app.ask(`Sorry, I didn't understand. What do you want to know about R.I.T?`, NO_INPUTS);
            }
        }
    }

    // Say they've heard it all about this category
    function noFactsLeft(app, currentCategory, redirectCategory) {
        let parameters = {};
        parameters[CATEGORY_ARGUMENT] = redirectCategory;
        // Replace the outgoing facts context with different parameters
        app.setContext(FACTS_CONTEXT, DEFAULT_LIFESPAN, parameters);
        let response = `Looks like you've heard all there is to know \
about the ${currentCategory} of R.I.T. I could tell you about more specific things, like \
${redirectCategory} instead. `;
        response += `So what would you like to hear about?`;
        return response;
    }

    let actionMap = new Map();
    actionMap.set(UNRECOGNIZED_DEEP_LINK, unhandledDeepLinks);
    actionMap.set(TELL_FACT, tellFact);

    app.handleRequest(actionMap);
};