# Website admin guide

For the staff who update the website. The admin area is in English; everything visitors see is in Tamil.
The same steps are also inside the admin area: press **Help** in the left menu.

## Log in
1. Open your website address followed by `/admin` (for example `https://yourwebsite.org/admin`).
2. Type the username and password you were given, then press **Log in**. The eye button shows the password while you type it.
3. When you finish, press **Log out** at the bottom of the menu, especially on a shared computer.

Forgot the password? Ask the developer. They can set a new one in a minute.

## Finding your way around
- **On a computer** the menu is on the left. **On a phone** press the ☰ button at the top left to open it.
- The gold **New post** button is always there.
- **Home** shows a short summary: how many posts you have, what is still missing on the website (banner photo, bank details, contact details…), and your latest posts.
- Menu groups: **Content** (Posts, Committee), **Registry** (Submissions, Form questions, Reviewers, Registry page text) and **Website pages** (Home page, Donation, Contact and links, Radio, Radio schedule).
- Press the name of a group to open or close it. The group of the page you are on opens by itself, a closed group that holds your page shows a small gold dot, and the menu remembers how you left it. So the menu never needs a scroll bar; if the screen is very short, a soft fade at the bottom tells you there is more below, and the wheel or a finger scrolls it.
- The small **« icon at the top right of the menu**, next to **Admin Panel** (on a computer), shrinks the menu to icons, so the page gets more room. The two logos then stand one above the other at the top, with the **»** icon under them: press it to open the menu again. Hold the mouse over an icon to see its name.
- **Log out** is the last button at the bottom of the menu, with the name of the person who is signed in just above it.

## Add news (New post)
It works like a Facebook post.
1. Press **New post**.
2. Choose which **section** the news is for. The sections are shown by their Tamil names: அன்பின்பாதை – சமூகப் பணிகள், பசுமைத் தாயகம், கலை & இலக்கியம், எண்ணம்போல் வாழ்க்கை மாணவர் மன்றம், “சிறுகதை மஞ்சரி” அனைத்துலக வாசகர் வட்டம், வாசிப்போம் சுவாசிப்போம்.
3. Write the news in the big box, in Tamil. The first line becomes the title, so make it short and clear. One post can hold up to **60,000 characters**, which is about **6,600 Tamil words** (a Tamil word takes about 9 characters with its space) or about 9,000 English words. If a post is longer, the box stops you and the page says so.
4. Under **Add to your post** you can add:
   - **Photos**: pick as many as you like (up to 20). Use the arrows to change the order. The first photo is the cover picture.
   - **YouTube video**: paste the link of the video.
   - **Facebook link**: paste the link of a public Facebook post or video, and it shows inside the post.
   - **Date**: only needed to give an older date to an old post.
5. Press **Post** to publish at once, or **Save as draft** to keep it hidden for now.

The post appears on the website within a few seconds. A small note in the bar at the bottom says "You have unsaved changes" until you save.

**Messages:** when something is saved, published, deleted or goes wrong, a small notice (a "toast") appears in the top-right corner of the screen (top of the screen on a phone) and disappears by itself after a few seconds. Errors stay a little longer. Press the × to close one, or hold the mouse over it to keep it open. If you try to leave a page through the menu with unsaved changes, a window asks "Leave without saving?". Closing or refreshing the browser tab with unsaved changes shows the browser's own standard warning, which websites cannot restyle.

## Change or remove a post (Posts)
- Use the tabs **All / Published / Drafts** and the section buttons to find a post.
- **Edit**: change the text, photos or links, then press **Save changes**.
- **Unpublish**: hides the post from visitors but keeps it. **Publish** shows it again.
- **View on website** opens the published post.
- The red bin deletes the post and its photos for good. A window asks you to confirm first.

## Committee members (Committee)
- The page has these groups, in this order: Director, President, Secretary and Treasurer (shown together as நிர்வாகத் தலைமை), **Committee members** (நிர்வாகசபை உறுப்பினர்கள்), **Patrons** (போசகர்கள்), and **Members** (உறுப்பினர்கள், the ordinary members, always last). A group with nobody in it stays hidden on the website.
- **Add member**: type the name in Tamil (with திரு, திருமதி, செல்வி), choose the group, add a photo. Use the **Add member** button inside a group to start with that group chosen.
- **Edit**: change details or the photo. The role title is filled in from the group if you leave it empty.
- Use the **← →** buttons on a card to move a person earlier or later inside their group.
- The red bin removes a member (you are asked to confirm).

## Website pages
Each page has its own **Save changes** button and saves only its own details, so nothing else is affected.
- **Home page**: the banner photo, tagline, headline and welcome words.
  - The banner works best as a wide landscape photo. Words are written over it in white, so avoid very bright photos.
  - If you press **Remove image** by mistake, press **Undo**. The photo is only deleted when you press **Save changes**.
- **Donation**: bank details shown on the Donation page. The account name and number get "copy" buttons for donors.
- **Contact and links**: phone, email, address, and the Facebook and YouTube links. They appear on the Contact page and in the footer of every page.
- **Radio**: puts the Pothigai Internet Radio player on the website (see below).

## Radio (Pothigai Internet Radio)
The radio itself runs on its own small server (AzuraCast). The website only needs its listening address.
1. Open **Radio** under Website pages.
2. In AzuraCast, open your station and copy the **Stream URL** (the listening address, often ending in `.mp3`). It must start with `https://`.
3. Paste it into **Stream address** and press **Save changes**.
4. Optional: paste the **Song name address** (in AzuraCast it looks like `https://your-radio-site/api/nowplaying/your-station`) to show the song that is playing.

Once a stream address is saved, the radio appears in four places: a band on the Home page, its own **Radio** page, a round radio button next to Donate in the top bar (in the phone menu on phones), and a link in the footer. When a visitor presses play, a small player stays at the bottom of the screen and keeps playing while they open other pages. They stop it with the stop button.

- Visitors can share the radio with anyone: right under the player on the Radio page there is a share row (**Facebook**, **WhatsApp**, **Copy link**). It shares the name of the radio and the address of the Radio page.
- To hide the radio for a while (for example, while the radio server is being fixed), switch off **Show the radio on the website** and save. The addresses are kept.
- If the address is empty or does not start with `https://`, the radio is not shown.
- If the radio server is down, visitors see a friendly message and a "try again" button.

## Radio schedule (programme times)
Shows visitors when your radio programmes are on, in a list on the Radio page, right under the player and above **நீங்கள் கேட்கலாம்**.
1. Open **Radio schedule** under Website pages (there is also a link on the Radio settings page).
2. Press **Add programme**.
3. Choose **On one date** (a single programme) or **Every week** (it repeats on the same day each week).
4. Pick the date, or the day of the week, then the **start time** and, if you like, the **end time**.
5. Type the **programme heading** in Tamil. The box on the right, **How visitors will see it**, shows the exact wording, so you can check it before you save.
6. Press **Add programme**. It appears on the Radio page at once.

- Times are Sri Lanka time. The page tells visitors so.
- Programmes are listed with the soonest first, and the nearest one is marked **அடுத்தது** (next).
- A programme with a single date disappears from the website by itself once it is over (if you gave no end time, about two hours after it starts). It stays in the admin under **Past programmes**, so you can delete it or copy its wording. Weekly programmes stay until you delete them.
- To change a programme press **Edit**. To remove one press the red bin. You are asked to confirm first.
- If the radio is switched off (or has no stream address), the whole Radio page is hidden, so the schedule is hidden too. The admin page reminds you of this.
- The Radio page refreshes itself every few minutes, so a finished programme can stay for a few minutes after its time.

## Registry of writers and artists (படைப்பாளிகள் பதிவகம்)
A free registry where Tamil writers and artists, in Sri Lanka and abroad, register themselves. Visitors fill in a form, you check it, and only after you approve it does the person appear on the website. It is a menu item under **எங்களைப் பற்றி**, after **நிர்வாகசபை**. Everything is in the **Registry** group of the admin menu.

**Switch it on.** It is hidden until you are ready. Open **Registry page text**, switch on **Show the Registry on the website**, and press **Save changes**. Use **Accept new registrations** to stop new registrations for a while (people already approved stay visible). On the same page you can reword the heading, the introduction, the reasons to join, the privacy note, the agreement people tick, and the thank-you message. Each box already holds the words visitors see now, so you can change them in place. A small tag at the end of each box's name says **Standard wording** while the words are unchanged; once you change them, the tag becomes a **Use the standard wording again** button that brings the standard words back.

**What visitors see on the registration form.** The steps **1 - 2 - 3 …** are at the top of the form, one for each group of questions (the same groups as the numbered tabs in Form questions; a group with no questions switched on is skipped). Visitors see one group at a time and press **அடுத்தது** (next) to go on, or **முந்தையது** (previous) to go back. Any number can also be pressed: going back always works, and going forward works when the required questions of the steps in between are answered (if not, the form shows the first step with a missing answer). The steps already reached stay purple. "Next" checks the required questions of that step. The agreement tick and the **பதிவை அனுப்புக** (send) button are on the last step. If something is wrong when it is sent, the form goes back to the step that has the problem, and the phone's Back button goes to the previous step. Two short questions sit side by side with their boxes at the same height; a question that would stand alone takes the whole row. On a phone the short privacy note comes first, then the form, and the long list of reasons to join is under the form, so a visitor reaches the questions without scrolling past it.

**What visitors see on the list page.** A search box for names, a switch (**everyone / Sri Lanka / abroad**) and drop-down choices. Choosing from a drop-down or the switch updates the list at once, without pressing a button. Under **Sri Lanka** visitors can choose a district and then a division; under **abroad** they choose a country. The choices shown are only those that real, approved people have, and only for questions you switched on as a **Search filter**.

**Design the form (Form questions).**
- The questions are in numbered tabs (1, 2, 3 …), one tab for each group, so the page stays short. Press a tab to change group; the page does not reload. The gold **Add a question** button is at the top right, next to the heading, and opens a small window.
- Each question has switches: **On the form** (shown or hidden), **Required**, **Who can see it**, and **Search filter**.
- **Who can see it:** *Public* is shown on the person's page. *Private* is only for you (email and phone are private to begin with). *Person chooses* adds a "show this publicly" tick box next to the question, so the person decides.
- **Search filter** lets visitors narrow the list by that answer (for example country, district, field). Only public questions can be filters, so a private answer can never be found by searching.
- Press **Edit** on a question to reword it, change its help text, or change the choices of a list. Use the arrows to move a question up or down.
- Press **Add a question** to add your own (short answer, long answer, number, date, a list to pick from, a web link and so on). You can delete the questions you added; the standard ones can only be switched off.
- **Date of birth** is one of the standard questions (in **Basic details**). It is a **Date** question: a box with a calendar (on a phone, the phone's own date picker), and a date that does not exist (such as 31 February), is before 1900 or is in the future is refused. It starts as **Private** (only you, and a reviewer you allow to see private details) and **not required**. It is shown on the website only if you switch it to Public or to "Person chooses", and then as, for example, 21 மார்ச், 1985.
- Changes show on the registration form and on the public pages at once, including for people who are already approved.

**Check and approve (Submissions).**
1. New registrations wait in the **Waiting** tab. Open one. The card at the top shows who it is (photo, name, registry number, where and when it came from, and the status) with all the decision buttons.
2. Under the card are four tabs. They open at once, without reloading the page, and the address changes with them, so you can send the link of a tab:
   - **Answers**: every answer, including the private ones, in numbered steps (1, 2, 3 …) like the **Add a person** page. Press any number to go to that step, or use **Previous** and **Next**; nothing has to be done in order. Correct any answer and press **Save changes** (the bar at the bottom stays in view and says when there are unsaved changes). If an answer is wrong, for example an empty name, the form goes to that step, the number turns red and the box is marked.
   - **Reviewer notes**: what reviewers said. The small number on the tab shows how many notes there are.
   - **Note and agreement**: your private note for this person (never shown to anyone else), and the agreement the person ticked, with the time.
   - **History**: everything that happened to this entry, newest first.
3. Press **Approve and publish**. The person gets a registry number such as **AP-ART-00001**, which never changes, and appears on the website.
4. Other buttons: **Ask for an update** or **Reject** (a small window asks for a reason that only you can see), **Hide from the website** (you can show the person again later), **View on the website**, and the red bin, **Delete this entry** (asks you first). A person you ask for an update, reject or hide is not shown on the website until you approve again.
5. If you changed an answer but did not press **Save changes** yet, the page asks "Leave without saving?" before approving, rejecting, hiding or saving a note, so a correction is not lost by accident. Press **Stay on this page**, then **Save changes**.
6. **Add a person** lets you fill the same form that visitors fill, for someone who cannot use the website. It has the same numbered steps (1, 2, 3 …) with **Previous** and **Next**; a step with a missing required answer stops you with a red message, and the numbers can be pressed to move around. **Publish on the website now** is a tick box on the last step: leave it off and the person waits in the list until you approve.
- The **Submissions** page has a tab for each status (Waiting, Approved, Needs an update, Rejected, Hidden, All) and a search by name, place and field. The **Field** box opens a neat panel with every field in columns: pick one, then press **Search** (the first row, **All fields**, clears it). **Add a person** and **Open the public page** are at the top right. On a phone the two buttons share one row (the second is a small square icon), the status tabs are one row that you swipe sideways, and the search button is the round magnifier beside the name box.
- Where people live: **Sri Lanka** (district, then division) or **another country**. In the admin panel the long lists (district, division, country) open as a neat panel, and the country list has a small search box. The village (Grama Niladhari division) and the postal code are private to begin with; switch them to Public only if you want them shown.

**Ask someone else to look (Reviewers).** A *reviewer* is a person you trust to look at registrations. Each reviewer has **one link and one password that stay the same**. You make the reviewer once, and then send people to them whenever you like.
1. **Make the reviewer.** Open **Reviewers** in the menu and press **Add a reviewer**. Write the name, press **Make one for me** (or type your own password, at least 8 characters), choose how many days the link works, and decide whether the reviewer may see private details. Leave **Reviewer can see private details** off unless the reviewer really needs the email, the phone or other answers the person did not agree to show publicly: off, the reviewer sees exactly what the public would see. Press **Add this reviewer**. A window shows the link and the password with a **Copy** button each.
2. **Send people.** Open **Submissions**, tick the people (or press **Select all on this page**) and press **Send for review**. A window lists your reviewers: tick one, several, or press **Select all** (a search box appears when there are many). Press **Send**. The same window then shows the link and the password of each chosen reviewer, ready to copy. A person already on a reviewer's list is not added twice, and the window says how many were new. A reviewer whose days are over is greyed out and moved to the bottom of the list: press **Edit** on the Reviewers page and give more days first. On a phone, as soon as you tick someone, a bar with the number ticked and the **Send for review** button stays at the top of the screen while you scroll, so you never have to scroll back up.
3. **Send the link and the password** to the reviewer yourself, in two separate messages. The next time you send this reviewer more people, they use the **same link and password**: they only open the link again and the new people are on their list.
4. **Look at them again any time.** On the **Reviewers** page press **Link and password** on a reviewer's card: the link and the password appear (the password as dots until you press the eye), each with **Copy**. They are kept locked in the database, so a copy of the database alone shows nothing, and they are only opened when you press the button.
5. **What the reviewer sees.** They open the link, type the password, and see their list: how many are done, two tabs (**to look at** and **done**), and a search by name. Each person opens on a page of their own with **Previous** and **Next**. They can correct answers (in numbered steps like yours) and press **looks good** or **needs a fix**, with a note. They can never approve, never see other pages of the admin, never change the photo, and never change what a person agreed to show publicly. A person you already decided about shows as "decided" and cannot be changed.
6. **What you see.** In **Submissions** every person shows a small label for each reviewer they were sent to ("Sent to Priya", then "Priya: looks good" or "Priya: needs a fix"). On the person's page, **Reviewer notes** has the notes and **History** shows who changed what.
- On a reviewer's card: **Link and password**, **Edit** (change the name, who sees private details, give more days from today, make a **new password** or **a new link**: the old one stops working at once and the reviewer has to use the new one; use a new link if the old one went to the wrong person), and **Cancel the link** (asks you first; the reviewer cannot open it again). **Show the people** lists the people on the reviewer's list, what the reviewer said about each, and an **×** to take someone off the list.
- A reviewer whose link was cancelled or whose days are over can be taken off the page with **Remove this reviewer** (asks you first). What they said stays in each person's history.
- If the same person needs private details for one batch and not for another, make two reviewers (for example "Priya" and "Priya (private)").
- Wrong passwords are counted: after six wrong tries the link is blocked for a while, even for the right password.
- Never give a reviewer your own admin password.

**Privacy and safety.** Private answers are never sent to visitors. New registrations wait for you, so nothing appears without your approval. A visitor can send only a few registrations in a short time, and a hidden trap catches robots. People can ask you to correct or remove their entry; you can do both from their page. Please check Sri Lanka's data-protection rules (Personal Data Protection Act) with a lawyer before you announce the registry.

## Adjust a photo (move, zoom, rotate)
- Next to the home banner and each committee photo there is an **Adjust** button. In a news post, each photo has a small crop button.
- In the window that opens: **drag** the photo to move it, use the **slider** (or the + and - buttons, or two fingers) to **zoom**, and press **Rotate left / Rotate right** if it came out sideways.
- Press **Use this photo** to keep your changes, or **Cancel** to leave the photo as it was.
- When you choose a *new* banner or committee photo, this window opens by itself, so you can place the photo before it is saved.
- **Banner:** the dashed lines show the middle part that is always visible on a phone. Keep the main subject between them.
- **Committee photos:** the round frame shows how the photo will look on the website. Put the face in the middle.
- Adjusting a photo that is already saved works on the saved picture. To show a part of the original photo that was already cut away, choose the original photo again with **Change image**.

## Photo tips
- Any photo from a phone is fine. It is made smaller automatically before it is saved.
- Use JPG, PNG or WebP photos.

## If something looks wrong
- Refresh the page once.
- Log out and log in again.
- Tell the developer what you were doing and what you saw. The database is backed up every week.
