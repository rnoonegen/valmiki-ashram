/** Default copy shown above the built-in registration form when the contest has no custom intro saved. */
export const DEFAULT_BUILT_IN_REGISTRATION_INTRO = `Viswaguru Bharat Strategy Contest #1 Submission Form
🎥 Viswaguru Bharat Short Video Contest – Win ₹10,000! - How to DECOLONIZE Indian Education System?

!!!Become an Indic Influencer!!!

Share your powerful strategy for revamping India's current colonial education system and transforming the nation into a Viswaguru once again.

Create a compelling short video (maximum 2 minutes) and stand a chance to win ₹10,000!



📌 How to Participate

Step 1:
Watch the contest rules and guidelines in the video provided below.

Step 2:
Download the Arattai App and join our channel through the 
Link for the Arattai Channel: Arattai Channel 
Link on our website(contest) : www.valmikiashram.org/VishwaguruBharathContest1

Step 3:
Create a short video (up to 2 minutes) in any Indian Language explaining your strategy and upload it to ALL your social media accounts with the hashtags #ValmikiAshramOrg #ViswaguruBharatContest1

Step 4:
Share your video widely with family, friends, and networks to get the maximum number of views.

Step 5:
Submit your video link using this Google Form by 30 December 2025, 9:00 AM IST.
Make sure to upload a clear screenshot of the view counts from each social platform where your video is posted.

Step 6:
Winner will be announced on 30 December 2025.



🏆 Judgement Criteria
         : Creation of the video only after 15th November 
        :60% – Content Quality (your idea, clarity, impact)
        :40% – Total View Count across all social media platforms



📌 Follow & Tag Our Official Handles(Must)
        :YouTube: @ValmikiAshramOrg
        :Instagram: @valmiki.ashram
        :X (Twitter): @ValmikiAshram
        :Facebook: Valmiki Ashram Official Page`;

export function resolveBuiltInRegistrationIntro(raw) {
  const s = String(raw || '').trim();
  return s || DEFAULT_BUILT_IN_REGISTRATION_INTRO;
}
