import Stripe from 'stripe';
import Luxon from 'luxon'
const stripe = new Stripe(process.env.STRIPE_SK);

const getDaysInAmonth = () => {
  var now = new Date();
  return new Date(now.getFullYear(), now.getMonth()+1, 0).getDate();  
};

export default async (req, res) => {
  try {
    //const {  } = req.body;

    const stripeToken = {
      "access_token": "sk_test_51KawspDYK4mL48E826KbmatFG9UEHt6nJXrWdVBDdiDPkr3RXjGf4gbkcONvp4YtaLsNKWMuK9a6s6u6ZcSoAnmW00TRCcfREj",
      "livemode": false,
      "refresh_token": "rt_ONXRXqgs1cGpaVnvzc6LbonJfhiOjB1wXfw7yrGZRqdUJJvd",
      "token_type": "bearer",
      "stripe_publishable_key": "pk_test_51KawspDYK4mL48E8vWe52qoYX2Pl7btGYlNphutOl0sllNwOcfyslyVW0xwRwcAvbihUzcaZgWxeajuz3NHhE0RB00Dgs9GgyM",
      "stripe_user_id": "acct_1KawspDYK4mL48E8",
      "scope": "read_write"
    }

    let allSubs = [];

    const getAllSubscriptions = async (stripeAccount = null, starting_after = null) => {
      let options = { status: 'active', limit: 1 };
      if (starting_after) options.starting_after = starting_after;

      let subscriptions = await stripe.subscriptions.list(
        options,
        { stripeAccount }
      );

      allSubs.push(...subscriptions.data);

      if (subscriptions.has_more) {
        await getAllSubscriptions(stripeAccount, subscriptions.data[subscriptions.data.length - 1].id);
      }
    }
    

    await getAllSubscriptions('acct_1KawspDYK4mL48E8');
    //console.log(allSubs)


    const calcMRRPerSub = (sub) => {
      //console.log('Sub data', sub)
      //console.log('Sub items', sub.items.data)
      let mrr = 0;
      sub.items.data.map((d) => {
        let rev = 0;
        if(d.plan.interval == 'month') {
          rev = d.plan.amount * d.quantity    
        } else if (d.plan.interval == 'annual') {
          rev = (d.plan.amount * d.quantity)/12;
        } else if (d.plan.interval == 'day') {
          const totalDaysInMonth = getDaysInAmonth();
          rev = totalDaysInMonth * d.plan.amount * d.quantity
        } else {
          console.error(`Plan id: ${d.id} has en error and doesn't have monthly or annual billing cycle`)
          console.dir(d)        
        }
        mrr += rev 
      })
      return mrr;
    }

    // For each sub calculate the MRR and add them up
    let totalMRR = 0;
    allSubs.map((sub) => {
      totalMRR += calcMRRPerSub(sub)
    })

    // Convert to Dollars from Cents
    totalMRR = totalMRR/100;
    console.log(`Total MRR is : $${totalMRR}`)

    return res.status(200).json({
      totalMRR,
      allSubs
    });

  } catch(e) {

    return res.status(400).json();

  }
}
