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
- Menu groups: **Content** (Posts, Committee) and **Website pages** (Home page, Donation, Contact and links, Radio).

## Add news (New post)
It works like a Facebook post.
1. Press **New post**.
2. Choose which **section** the news is for. The sections are shown by their Tamil names: அன்பின்பாதை – சமூகப் பணிகள், பசுமைத் தாயகம், கலை & இலக்கியம், வாசிப்போம் சுவாசிப்போம்.
3. Write the news in the big box, in Tamil. The first line becomes the title, so make it short and clear.
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
- **Add member**: type the name in Tamil (with திரு, திருமதி, செல்வி), choose the group, add a photo.
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

- To hide the radio for a while (for example, while the radio server is being fixed), switch off **Show the radio on the website** and save. The addresses are kept.
- If the address is empty or does not start with `https://`, the radio is not shown.
- If the radio server is down, visitors see a friendly message and a "try again" button.

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
