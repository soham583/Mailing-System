document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#compose-error').style.display = 'none';
  document.querySelector('#reply-error').style.display = 'none';

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#reply-view').style.display = 'none';
  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  document.querySelector('#compose-submit').addEventListener('click', function(event){
    event.preventDefault();
    rec = document.querySelector('#compose-recipients').value;
    sub = document.querySelector('#compose-subject').value;
    bod = document.querySelector('#compose-body').value;
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
          recipients: rec,
          subject: sub,
          body: bod
      })
    })
    .then(response => response.json())
    .then(result => {
        // Print result
        if ('error' in result){
          console.log(result);
          document.querySelector('#compose-error').style.display = 'block';
          document.querySelector('#compose-error-i').innerHTML = `<p>${result['error']}</p>`;
          return false;
       }
        else {
          console.log(result);
          document.querySelector('#compose-error').style.display = 'none';
          load_mailbox('sent');
          return false;
        }
    });
  })
}
const emailele = document.createElement('div');
emailele.setAttribute("style","border: 1px solid black;border-radius:5px");

function load_mailbox(mailbox) {

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#compose-error').style.display = 'none';
  document.querySelector('#reply-view').style.display = 'none';
  document.getElementById('emails-view-i').innerHTML = "";

  // Show the mailbox name
  document.querySelector('#emails-view-headline').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // list of mails
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
      // Print emails
      var x = emails['length'];
      for (i=0;i<x;i++){
        const emailele = document.createElement('div');
        emailele.setAttribute("style","cursor:pointer;border: 1px solid black;border-radius:5px;padding:5px");
        emailele.setAttribute("id",`${emails[i].id}`);
        emailele.setAttribute("onclick",'load_mail(this)');
        emailele.setAttribute("class",'email');
        k = `${emails[i].read}`;
        if (mailbox == 'inbox' || mailbox == 'archive'){
          console.log('assss')
          emailele.innerHTML = (`<p><strong>   ${emails[i].sender}</strong></p><p>   ${emails[i].subject}</p><p>   ${emails[i].timestamp}</p>`);
        }
        if (mailbox == 'inbox' && k == 'true'){
          emailele.setAttribute("style","cursor:pointer;border: 1px solid black;border-radius:5px;padding:5px;background-color:#cfcfcf");
        }
        if (mailbox == 'sent'){
          emailele.innerHTML = (`<p><strong>${emails[i].recipients}</strong></p><p>${emails[i].subject}</p><p>${emails[i].timestamp}</p>`);
        }
        document.querySelector('#emails-view-i').append(emailele);
      }

      console.log(emails);

      // ... do something else with emails ...
  });

}
function load_mail(mail){
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#compose-error').style.display = 'none';
  document.querySelector('#reply-view').style.display = 'none';
  document.getElementById('emails-view-i').innerHTML = "";
  document.getElementById('emails-view-headline').innerHTML = "";
  id = mail.id;
  console.log(mail);
  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
      // Print email
      var idi = `${email.id}`;
      var arc = `${email.archived}`;
      var bodyn = `${email.body}`.split("|");
      var bodyn1 = bodyn.join("</br>");
      const emailv = document.createElement('div');
      emailv.setAttribute("style","padding:10px");
      emailv.innerHTML = (`<p><strong> From: </strong> ${email.sender} </p><p><strong> To :</strong> ${email.recipients}</p><p><strong> Subject: </strong> ${email.subject}</p><p><strong> Timestamp: </strong>${email.timestamp}</p><hr><p>${bodyn1}</p>`);
      document.querySelector('#emails-view-i').append(emailv);
      const but1 = document.createElement('button');
      but1.setAttribute("type", 'button');
      //but1.setAttribute("name", `${email.id}`);
      but1.setAttribute("class", 'btn btn-outline-success');
      but1.setAttribute("id",'archive');
      m = `${email.archived}`;
      console.log(m);
      if (m == 'true'){
        but1.innerHTML = 'Unarchive';
      }
      else {
        but1.innerHTML = 'Archive';
      }
      but1.setAttribute("onclick", `change_archive(${idi},${arc})`);
      document.querySelector('#emails-view-i').append(but1);
      const but2 = document.createElement('button');
      but2.setAttribute("type", 'button');
      but2.setAttribute("class", 'btn btn-outline-success');
      but2.innerHTML = 'Reply';
      but2.setAttribute("id",'reply');
      but2.setAttribute("onclick", `reply_mail(${idi})`);
      document.querySelector('#emails-view-i').append(but2);

      console.log(email);

      // ... do something else with email ...
  });
  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
        read: true
    })
  })

}

function change_archive(idi,arc){
  console.log(idi);
  console.log(arc);
  if (`${arc}` == 'false'){
    document.getElementById('archive').innerHTML = 'Unarchive';
    fetch(`/emails/${idi}`, {
      method: 'PUT',
      body: JSON.stringify({
          archived: true
      })
    })
  }
  else {
    document.getElementById('archive').innerHTML = 'Archive';
    fetch(`/emails/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
          archived: false
      })
    })
  }
}

function reply_mail(idi){
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#reply-view').style.display = 'block';
  fetch(`/emails/${idi}`)
  .then(response => response.json())
  .then(email => {
      // Print email
      var strp = `${email.subject}`;
      var ini = 'Re: '
      document.querySelector('#reply-recipients').value = `${email.sender}`;
      if (strp.slice(0,4)=='Re: '){
        document.querySelector('#reply-subject').value = `${strp}`;
      }
      else {
        document.querySelector('#reply-subject').value = ini.concat("",strp);
      }
      var output = `On ${email.timestamp}  ${email.sender} wrote:|
          ${email.body} |
          `;
          // ... do something else with email ...
      document.querySelector('#reply-body').value = output;
      // ... do something else with email ...
      console.log(email);

  });
  document.querySelector('#reply-submit').addEventListener('click', function(event){
    event.preventDefault();
    rec = document.querySelector('#reply-recipients').value;
    sub = document.querySelector('#reply-subject').value;
    bod = document.querySelector('#reply-body').value;
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
          recipients: rec,
          subject: sub,
          body: bod
      })
    })
    .then(response => response.json())
    .then(result => {
        // Print result
        if ('error' in result){
          console.log(result);
          document.querySelector('#reply-error').style.display = 'block';
          document.querySelector('#reply-error-i').innerHTML = `<p>${result['error']}</p>`;
          return false;
       }
        else {
          console.log(result);
          document.querySelector('#reply-error').style.display = 'none';
          load_mailbox('sent');
          return false;
        }
    });
  })
}
