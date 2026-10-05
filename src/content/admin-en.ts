import type { IconName } from "@/components/admin/Icon";
import { categories } from "@/content/ta-LK";

export type SettingFieldType =
  | "text"
  | "textarea"
  | "email"
  | "tel"
  | "facebook"
  | "youtube"
  | "url"
  | "toggle"
  | "image";

export type SettingField = {
  key: string;
  label: string;
  help?: string;
  type: SettingFieldType;
  maxLength: number;
  lang?: string;
};

export type SettingGroup = { title: string; fields: readonly SettingField[] };

export type SettingSection = {
  slug: string;
  title: string;
  description: string;
  icon: IconName;
  previewHref: string;
  groups: readonly SettingGroup[];
};

const homeGroup: SettingGroup = {
  title: "Banner and words",
  fields: [
    {
      key: "home_banner",
      label: "Banner photo",
      help: "A wide, landscape photo works best. White words are written over it, so avoid very bright pictures.",
      type: "image",
      maxLength: 200,
    },
    {
      key: "site_tagline",
      label: "Tagline",
      help: "The short motto shown on the website. Write it in Tamil.",
      type: "text",
      maxLength: 120,
      lang: "ta",
    },
    {
      key: "home_headline",
      label: "Headline",
      help: "The big line on the home page. Write it in Tamil.",
      type: "text",
      maxLength: 160,
      lang: "ta",
    },
    {
      key: "home_welcome",
      label: "Welcome text",
      help: "A few friendly lines under the headline. Write it in Tamil.",
      type: "textarea",
      maxLength: 600,
      lang: "ta",
    },
  ],
};

const bankGroup: SettingGroup = {
  title: "Bank account",
  fields: [
    { key: "bank_name", label: "Bank name", type: "text", maxLength: 100 },
    { key: "bank_branch", label: "Branch", type: "text", maxLength: 100 },
    { key: "bank_account_name", label: "Account name", type: "text", maxLength: 120 },
    {
      key: "bank_account_number",
      label: "Account number",
      help: "Visitors get a Copy button next to the account name and number.",
      type: "text",
      maxLength: 40,
    },
    {
      key: "bank_note",
      label: "Extra note",
      help: "Optional. For example, how to tell you about a donation. Shown on the Donation page.",
      type: "textarea",
      maxLength: 500,
    },
  ],
};

const contactGroup: SettingGroup = {
  title: "Contact details",
  fields: [
    { key: "contact_phone", label: "Phone number", type: "tel", maxLength: 40 },
    { key: "contact_email", label: "Email address", type: "email", maxLength: 120 },
    {
      key: "contact_address",
      label: "Address",
      help: "You can use more than one line. It is shown on one line in the footer.",
      type: "textarea",
      maxLength: 300,
    },
  ],
};

const socialGroup: SettingGroup = {
  title: "Social media",
  fields: [
    {
      key: "facebook_url",
      label: "Facebook page link",
      help: "Example: https://www.facebook.com/yourpage",
      type: "facebook",
      maxLength: 200,
    },
    {
      key: "youtube_url",
      label: "YouTube channel link",
      help: "Example: https://www.youtube.com/@yourchannel",
      type: "youtube",
      maxLength: 200,
    },
  ],
};

const radioGroup: SettingGroup = {
  title: "Radio player",
  fields: [
    {
      key: "radio_enabled",
      label: "Show the radio on the website",
      help: "Switch this off to hide the radio for a while. Your addresses below are kept. The radio only appears once a stream address is added.",
      type: "toggle",
      maxLength: 1,
    },
    {
      key: "radio_stream_url",
      label: "Stream address",
      help: "The listening address of your radio. In AzuraCast, open your station and copy the Stream URL (it often ends in .mp3). It must start with https://",
      type: "url",
      maxLength: 300,
    },
    {
      key: "radio_nowplaying_url",
      label: "Song name address (optional)",
      help: "Shows the name of the song that is playing. In AzuraCast it looks like https://your-radio-site/api/nowplaying/your-station. Leave it empty if you are not sure.",
      type: "url",
      maxLength: 300,
    },
  ],
};

export const settingSections: readonly SettingSection[] = [
  {
    slug: "home",
    title: "Home page",
    description: "The big banner photo and the words visitors see first.",
    icon: "layout",
    previewHref: "/",
    groups: [homeGroup],
  },
  {
    slug: "donation",
    title: "Donation details",
    description: "Your bank account, shown on the Donation page so supporters can send help.",
    icon: "heart",
    previewHref: "/donate",
    groups: [bankGroup],
  },
  {
    slug: "contact",
    title: "Contact and links",
    description: "How people can reach you. Shown on the Contact page and at the bottom of every page.",
    icon: "phone",
    previewHref: "/contact",
    groups: [contactGroup, socialGroup],
  },
  {
    slug: "radio",
    title: "Radio",
    description:
      "Your internet radio, Pothigai Internet Radio. Add its address and a player appears on the home page and on its own Radio page.",
    icon: "radio",
    previewHref: "/radio",
    groups: [radioGroup],
  },
];

export const settingGroups: readonly SettingGroup[] = settingSections.flatMap((s) => s.groups);

// The five sections are shown by their Tamil names everywhere in the admin panel (not in English).
export const categoryLabel: Record<string, string> = Object.fromEntries(categories.map((c) => [c.slug, c.name]));

export const roleGroupEnglish: Record<string, string> = {
  director: "Director",
  president: "President",
  secretary: "Secretary",
  treasurer: "Treasurer",
  member: "Members",
  patron: "Patrons",
};

export const admin = {
  title: "Admin Panel",
  login: {
    title: "Admin Login",
    welcome: "Welcome back",
    subtitle: "Sign in to manage your website.",
    username: "Username",
    password: "Password",
    submit: "Log in",
    pending: "Logging in…",
    showPassword: "Show password",
    hidePassword: "Hide password",
    invalid: "Incorrect username or password.",
    blocked: "Too many failed attempts. Please wait a while and try again.",
    required: "Please enter your username and password.",
    failed: "Could not log in. Please try again.",
    backToSite: "Back to the website",
  },
  nav: {
    home: "Home",
    newPost: "New post",
    content: "Content",
    posts: "Posts",
    team: "Committee",
    website: "Website pages",
    homePage: "Home page",
    donation: "Donation",
    contact: "Contact and links",
    radio: "Radio",
    help: "Help",
    viewSite: "View website",
    logout: "Log out",
    menu: "Open menu",
    closeMenu: "Close menu",
    signedInAs: "Signed in as",
  },
  dashboard: {
    greeting: { morning: "Good morning", afternoon: "Good afternoon", evening: "Good evening" },
    question: "What would you like to do today?",
    actions: {
      post: "Write a post",
      member: "Add a member",
      home: "Edit home page",
    },
    stats: { published: "Published posts", drafts: "Drafts", members: "Committee members" },
    checklist: {
      title: "Getting your website ready",
      progress: (done: number, total: number) => `${done} of ${total} done`,
      allDone: "Everything is set up. Nice work!",
      setUp: "Set up",
      open: "Open",
      items: {
        banner: { label: "Home page banner photo", hint: "The big picture visitors see first." },
        bank: { label: "Bank details", hint: "So supporters know where to send help." },
        contact: { label: "Phone, email and address", hint: "Shown on the Contact page and in the footer." },
        social: { label: "Facebook or YouTube link", hint: "Lets visitors follow your pages." },
        radio: { label: "Radio stream address", hint: "Puts the Pothigai radio player on your website." },
        photos: {
          label: "Committee photos",
          hint: (withPhoto: number, total: number) => `${withPhoto} of ${total} members have a photo.`,
        },
        post: { label: "Your first news post", hint: "Share what you have been doing." },
      },
    },
    recent: {
      title: "Latest posts",
      viewAll: "See all posts",
      empty: "No posts yet. Write your first post and it will appear here.",
    },
  },
  common: {
    cancel: "Cancel",
    edit: "Edit",
    delete: "Delete",
    back: "Back",
    saving: "Saving…",
    required: "This field is required.",
    tooLong: (n: number) => `Maximum ${n} characters allowed.`,
    noticeCreated: "Created successfully.",
    noticeSaved: "Changes saved.",
    noticeDeleted: "Deleted successfully.",
    actionFailed: "Something went wrong. Please try again.",
    fixErrors: "Please fix the highlighted errors and try again.",
    unsaved: "You have unsaved changes",
    leaveDialog: {
      title: "Leave without saving?",
      message: "You have changes that are not saved yet. If you leave now, they will be lost.",
      stay: "Stay on this page",
      leave: "Leave without saving",
    },
    toastClose: "Close",
    yesDelete: "Yes, delete",
    deleting: "Deleting…",
    keep: "No, keep it",
  },
  posts: {
    title: "Posts",
    subtitle: "News and updates shown on your website.",
    newPost: "New post",
    editPost: "Edit post",
    backToPosts: "Back to posts",
    empty: "No posts found.",
    emptyAll: "No posts yet. Let's write your first one!",
    emptyFiltered: "No posts match this choice.",
    clearFilters: "Show all posts",
    columns: { post: "Post", category: "Category", status: "Status", date: "Date", actions: "Actions" },
    tabs: { all: "All", published: "Published", draft: "Drafts" },
    sections: "Section",
    allCategories: "All sections",
    published: "Published",
    draft: "Draft",
    view: "View on website",
    publish: "Publish",
    unpublish: "Unpublish",
    publishing: "Please wait…",
    deleteTitle: "Delete this post?",
    confirmDelete: "This post and its photos will be deleted for good. This cannot be undone.",
    previous: "Previous",
    next: "Next",
    page: (page: number, pages: number) => `Page ${page} of ${pages}`,
    photoCount: (n: number) => `${n} photo${n === 1 ? "" : "s"}`,
    hasVideo: "Video",
    hasFacebook: "Facebook link",
    noText: "(no text)",
    composer: {
      postingTo: "Posting to",
      chooseCategory: "Choose category",
      categoryQuestion: "Which section is this news for?",
      writeLabel: "Your news",
      placeholder: "What's new? Write your news here (in Tamil)…",
      addToPost: "Add to your post",
      photos: "Photos",
      video: "YouTube video",
      facebook: "Facebook link",
      date: "Date",
      addPhotos: "Add photos",
      uploadingPhotos: (done: number, total: number) => `Uploading photo ${done} of ${total}…`,
      removePhoto: "Remove photo",
      adjustPhoto: "Adjust photo",
      movePhotoEarlier: "Move earlier",
      movePhotoLater: "Move later",
      cover: "Cover",
      photoCount: (n: number, max: number) => `${n} / ${max} photos`,
      photoHint: "The first photo is the cover picture.",
      photosFull: "A post can have up to 20 photos.",
      youtubeLabel: "YouTube video link",
      youtubeHelp: "Paste a YouTube video link. The video plays inside the post.",
      facebookLabel: "Facebook post or video link",
      facebookHelp: "Paste the link of a public Facebook post or video. It is shown inside the post.",
      dateLabel: "Post date",
      dateHelp: "Posts are listed newest first by this date. Leave it as it is for today.",
      hide: "Remove",
      post: "Post",
      publishNow: "Publish",
      saveChanges: "Save changes",
      saveDraft: "Save as draft",
      unpublish: "Unpublish",
      working: "Please wait…",
      saved: "Saved.",
      waitForUploads: "Please wait until the photos finish uploading.",
    },
    errors: {
      text: "Write something, or add a photo, video or link.",
      textTooLong: (max: number) => `A post can have up to ${max} characters.`,
      category: "Choose a category before posting.",
      youtube: "Enter a valid YouTube video link (https://youtube.com/watch?v=… or https://youtu.be/…).",
      facebook: "Enter a valid Facebook link (https://facebook.com/…).",
      date: "Enter a valid date.",
      photos: "Some photos are invalid. Please upload them again.",
      tooManyPhotos: "A post can have up to 20 photos.",
      notFound: "That post no longer exists.",
    },
  },
  team: {
    title: "Executive Committee",
    subtitle: "The people shown on the Committee page of your website.",
    newMember: "Add member",
    editMember: "Edit member",
    backToTeam: "Back to committee",
    empty: "No members in this group yet.",
    count: (n: number) => `${n} member${n === 1 ? "" : "s"}`,
    moveUp: "Move up",
    moveDown: "Move down",
    moveEarlier: "Move earlier",
    moveLater: "Move later",
    deleteTitle: "Remove this member?",
    confirmDelete: "This member and their photo will be removed for good. This cannot be undone.",
    noPhoto: "No photo",
    form: {
      detailsTitle: "Member details",
      name: "Name",
      nameHelp: "Write it in Tamil, including the title (for example திரு, திருமதி, செல்வி).",
      group: "Group",
      roleTitle: "Role title",
      roleTitleHelp: "Shown under the name, in Tamil. Filled in automatically from the group if left empty.",
      subtitle: "Extra line (optional)",
      subtitleHelp: "For example a profession, shown under the role. Write it in Tamil.",
      photo: "Photo",
      photoHelp: "A clear head-and-shoulders photo works best. It is resized automatically.",
      create: "Add member",
      save: "Save member",
      saved: "Member saved.",
    },
    errors: {
      name: "Enter the member's name.",
      group: "Choose a group.",
      roleTitle: "Enter a role title.",
      photo: "Please upload the photo again.",
      notFound: "That member no longer exists.",
    },
  },
  settings: {
    title: "Settings",
    save: "Save changes",
    saving: "Saving…",
    saved: "Changes saved.",
    seeOnSite: "See this page on the website",
    fixErrors: "Please fix the highlighted errors and try again.",
    saveFailed: "Could not save. Please try again.",
    unknownSection: "That settings page does not exist.",
    tooLong: (n: number) => `Maximum ${n} characters allowed.`,
    errors: {
      email: "Enter a valid email address.",
      phone: "Enter a valid phone number.",
      facebook: "Enter a valid Facebook link (https://facebook.com/…).",
      youtube: "Enter a valid YouTube link (https://youtube.com/…).",
      url: "Enter a valid address that starts with https://",
      image: "Please upload the image again.",
    },
  },
  editor: {
    title: "Adjust photo",
    help: "Drag the photo to move it. Use the slider to zoom in or out.",
    circleHint: "On the website this photo is shown as a circle. Move and zoom so the face is in the middle.",
    phoneGuide: "The dashed lines mark the middle part that is always visible on a phone. Keep the main subject between them.",
    frameLabel: "Photo area. Drag to move. Use the arrow keys to nudge it, and plus and minus to zoom.",
    zoom: "Zoom",
    zoomIn: "Zoom in",
    zoomOut: "Zoom out",
    rotateLeft: "Rotate left",
    rotateRight: "Rotate right",
    apply: "Use this photo",
    applying: "Saving…",
    cancel: "Cancel",
    close: "Close",
    opening: "Opening photo…",
    openFailed: "This photo could not be opened. Please choose a different one.",
  },
  uploader: {
    adjust: "Adjust",
    adjustFailed: "Could not open this photo for adjusting. Please try again.",
    choose: "Choose image",
    change: "Change image",
    remove: "Remove image",
    removedNote: "The image will be removed when you press Save changes.",
    undo: "Undo",
    uploading: "Uploading…",
    noImage: "No image selected yet.",
    unsupported: "This image format is not supported. Use a JPG, PNG or WebP image.",
    failed: "Could not upload the image. Please try again.",
    notConfigured: "Photo storage is not set up yet.",
  },
  help: {
    title: "Help",
    intro: "Quick answers for everything you do in this panel. Tap a question to open it.",
    sections: [
      {
        title: "How do I add news to the website?",
        steps: [
          "Press the gold New post button.",
          "Choose which section the news is for.",
          "Write the news in the big box, in Tamil. The first line becomes the title, so keep it short and clear.",
          "Add photos, a YouTube video, a Facebook link or an older date if you need them.",
          "Press Post to publish it at once, or Save as draft to keep it hidden for now.",
        ],
        note: "The post appears on the website within a few seconds.",
      },
      {
        title: "How do I change, hide or delete a post?",
        steps: [
          "Open Posts in the menu.",
          "Press Edit on the post, change what you need, then press Save changes.",
          "Press Unpublish to hide a post from visitors without losing it. Press Publish to show it again.",
          "Press the red bin to delete a post for good. You will be asked to confirm first.",
        ],
      },
      {
        title: "How do I add or change committee members?",
        steps: [
          "Open Committee in the menu.",
          "Press Add member. Type the name in Tamil, choose the group and add a photo.",
          "To change someone, press Edit on their card.",
          "Use the arrow buttons on a card to move a person earlier or later inside their group.",
        ],
      },
      {
        title: "How do I change the home page, bank details or contact details?",
        steps: [
          "Open Home page, Donation or Contact and links under Website pages in the menu.",
          "Change what you need and press Save changes at the bottom.",
          "Each page saves only its own details, so nothing else is affected.",
        ],
        note: "On the Home page you can also change the big banner photo.",
      },
      {
        title: "How do I put the radio on my website?",
        steps: [
          "Open Radio under Website pages in the menu.",
          "In your AzuraCast, open your station and copy the Stream URL. This is the listening address. It starts with https://",
          "Paste it into Stream address and press Save changes.",
          "The player now appears on the home page and on its own Radio page, and Radio is added to the website menu. Visitors can keep listening while they read other pages.",
          "To hide the radio for a while, switch off Show the radio on the website and press Save changes. The address is kept.",
        ],
        note: "The address must start with https:// or browsers will not play it on your website.",
      },
      {
        title: "How do I move, zoom or rotate a photo?",
        steps: [
          "Press Adjust next to a photo. In a news post, press the small crop button on the photo.",
          "Drag the photo to move it. Use the slider, the + and - buttons, or pinch with two fingers to zoom.",
          "Press Rotate left or Rotate right if the photo came out sideways.",
          "Press Use this photo to keep your changes. Press Cancel to go back without changing anything.",
        ],
        note: "The home banner and committee photos open in this window by themselves when you choose a new photo, so you can place them straight away.",
      },
      {
        title: "Which photos work best?",
        steps: [
          "Any photo from a phone is fine. It is made smaller automatically before it is saved.",
          "Use JPG, PNG or WebP photos.",
          "For the home banner, choose a wide landscape photo that is not very bright.",
          "For committee members, a clear head-and-shoulders photo looks best.",
        ],
      },
      {
        title: "Something looks wrong. What should I do?",
        steps: [
          "Refresh the page once.",
          "Log out and log in again.",
          "If it still looks wrong, tell the developer what you were doing and what you saw.",
        ],
        note: "The website data is backed up every week.",
      },
    ],
  },
} as const;
