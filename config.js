/* =====================================================================
   KARUNA LIFECARE SETTINGS  -  the only file you ever need to edit.
   Open it in Notepad, change what is between the quotes, save,
   then re-upload the folder to your host.
   ===================================================================== */
window.KL_CONFIG = {

  /* 1) FORMS -> MASTER SHEET
     Paste the Web app URL from your Google Apps Script here (ends with /exec).
     Until you do, forms open a pre-filled email to you instead, so no enquiry is lost. */
  leadEndpoint: "",

  /* 2) GOOGLE ANALYTICS (optional). Example: "G-XXXXXXXXXX". Loads only after a visitor accepts cookies. */
  analyticsId: "",

  /* 3) SOCIAL LINKS. Add a link only after the official account exists. Must start with https:// */
  social: { instagram: "", facebook: "", linkedin: "", youtube: "" },

  /* 4) HEALTH STORE PRODUCTS. Add one block per product. Leave the list empty to show
     the "catalogue being prepared" page.
       name  : product name
       cat   : category (use the same wording for products in the same category)
       price : selling price in rupees (number, no commas)
       mrp   : optional original price (shown struck through)
       desc  : one short line
       img   : optional photo, e.g. "/products/walker.jpg" (put the file in the products folder)
       pay   : payment link from your payment gateway (must start with https://)
     Example (remove the // to use it):
  */
  products: [
    // { name: "Product name", cat: "Mobility & Walking Aids", price: 1999, mrp: 2499, desc: "Short description.", img: "/products/example.jpg", pay: "https://rzp.io/l/xxxxxxx" },
  ]
};
