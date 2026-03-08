// emailScraper.js
// Standalone script for scraping emails from Gmail, Outlook, and custom IMAP
// Extracts miles, origin, destination for invoice imaging and rate confirmation

import Imap from 'imap';
import { simpleParser } from 'mailparser';
import fs from 'fs';

// Configuration for multiple providers
const configs = {
  gmail: {
    user: process.env.GMAIL_USER,
    password: process.env.GMAIL_PASS,
    host: 'imap.gmail.com',
    port: 993,
    tls: true
  },
  outlook: {
    user: process.env.OUTLOOK_USER,
    password: process.env.OUTLOOK_PASS,
    host: 'outlook.office365.com',
    port: 993,
    tls: true
  },
  custom: {
    user: process.env.IMAP_USER,
    password: process.env.IMAP_PASS,
    host: process.env.IMAP_HOST,
    port: Number(process.env.IMAP_PORT) || 993,
    tls: true
  }
};

function connectIMAP(config) {
  return new Imap(config);
}

function fetchEmails(imap, onMail) {
  imap.once('ready', function() {
    imap.openBox('INBOX', false, function(err, box) {
      if (err) throw err;
      const searchCriteria = ['UNSEEN'];
      const fetchOptions = { bodies: '', markSeen: true };
      imap.search(searchCriteria, function(err, results) {
        if (err) throw err;
        if (!results.length) {
          imap.end();
          return;
        }
        const f = imap.fetch(results, fetchOptions);
        f.on('message', function(msg) {
          msg.on('body', function(stream) {
            simpleParser(stream, async (err, parsed) => {
              if (err) throw err;
              onMail(parsed);
            });
          });
        });
        f.once('end', function() {
          imap.end();
        });
      });
    });
  });
  imap.once('error', function(err) {
    console.error('IMAP error:', err);
  });
  imap.connect();
}

function extractInfo(email) {
  // Example regex for extracting miles, origin, destination
  const milesMatch = email.text.match(/Miles:\s*(\d+)/i);
  const originMatch = email.text.match(/Origin:\s*([\w\s]+)/i);
  const destMatch = email.text.match(/Destination:\s*([\w\s]+)/i);
  return {
    miles: milesMatch ? milesMatch[1] : null,
    origin: originMatch ? originMatch[1].trim() : null,
    destination: destMatch ? destMatch[1].trim() : null
  };
}

function saveParsed(email, info) {
  const entry = {
    subject: email.subject,
    from: email.from.text,
    date: email.date,
    ...info
  };
  fs.appendFileSync('parsedEmails.json', JSON.stringify(entry) + '\n');
}

function run(provider) {
  const config = configs[provider];
  if (!config) {
    console.error('Unknown provider:', provider);
    return;
  }
  const imap = connectIMAP(config);
  fetchEmails(imap, (email) => {
    const info = extractInfo(email);
    saveParsed(email, info);
    // Optionally, trigger automation here (e.g., update DB)
  });
}

// Usage: node emailScraper.js gmail|outlook|custom
const provider = process.argv[2] || 'gmail';
run(provider);

// To automate DB updates, add integration logic where indicated.
// Apply parsed info to invoice imaging and rate confirmation as needed.
