from flask import Flask
from flask_assistant import Assistant, ask
import random

app = Flask(__name__)
app.config['ASSIST_ACTIONS_ON_GOOGLE'] = True
assist = Assistant(app, '/')


@assist.action('Default Welcome Intent')
def input_welcome():
    speech = 'Welcome to R.I.T Assistant! ' \
             'What do you want to know about R.I.T?'
    return ask(speech)


@assist.action('Unrecognized Deep Link Fallback')
def deeplink_unknown():
    speech = 'Welcome to R.I.T Assistant! I\'m not quite sure how to respond to that. ' \
             'What do you want to know about R.I.T?'
    resp = ask(speech)
    return resp


@assist.action('Trivia')
@assist.action('Followup Trivia')
def tell_fact():
    facts = ['R.I.T was founded in 1829.', 'R.I.T\'s president is David C. Munson.',
             'Prior to 1955, athletic teams referred to themselves as The Techmen or The Blue Grey.']
    speech = random.choice(facts) + ' What else do you want to know about?'
    resp = ask(speech)
    return resp


@assist.action('Majors')
def tell_majors():
    speech = 'These are Majors my dude'
    resp = ask(speech)
    resp.card(text='Majors and Stuff')
    return resp


if __name__ == '__main__':
    app.run(debug=True)
