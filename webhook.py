from flask import Flask
from flask_assistant import Assistant, ask

app = Flask(__name__)
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
    return ask(speech)


@assist.action('choose_fact')
def tell_fact():
    speech = 'FOUNDED IN 1829, Rochester Institute of Technology is a privately endowed, ' \
             'coeducational university with nine colleges emphasizing career education and experiential learning.'
    return ask(speech)


@assist.action('majors')
def tell_majors():
    speech = 'These are Majors my dude'
    return ask(speech)


if __name__ == '__main__':
    app.run(debug=True)
