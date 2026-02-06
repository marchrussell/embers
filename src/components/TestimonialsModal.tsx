import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { X } from "lucide-react";

interface TestimonialsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const allTestimonials = [
  {
    name: "Jack C.",
    text: "I run a small business and therefore my mind runs at a million miles per hour. His calming techniques really helped me to slow down and understand priorities. Very impressive guy and highly recommend. Sorting a team away day too!!"
  },
  {
    name: "Mandi M.",
    text: "Breathwork has made the greatest impact to my day to day."
  },
  {
    name: "Pete C.",
    text: "I discovered Breathwork through James Nestor's book. After looking at options for face to face consultations I found March's practice. I have now worked with March for some time in person and online and I can feel the difference in terms of sleep quality and calmness. Equally importantly I can measure the difference with Apple Watch and whoop health metrics which all show improvements. Very happy customer!"
  },
  {
    name: "Kitty DN.",
    text: "Having previously really struggled with settling my mind at night time and trying lots of different methods to help switch my head off and fall asleep, my brother recommended I start trying out some breathwork sessions through an app called 'March'. I was pretty sceptical at first as I'd tried so many other platforms such as insight timer and calm to help me with my sleep. However, I've never found any other wellbeing practise so effective. March's voice for starters is so incredibly soothing, neutral, grounding and just really easy to listen to. The sessions are guided so the exercises are easy to follow and clearly explained. I use the app regularly and have honestly never looked back, my sleep is better than ever, I know how to use my breath to energise myself now even without the sessions. I feel empowered and more in control of my mind as a result, and daily life just generally feels that little bit less stressful and more present too. Truly couldn't recommend more highly…Thank you so much for giving me this incredibly powerful tool. 🙂"
  },
  {
    name: "Anthony GW.",
    text: "My recovery story begins with a month in a coma due to Covid-19 and also a stroke within that. It became apparent that breathwork could greatly help anyone needing to recover from a trauma, be it medical or otherwise. My nervous system was not functioning as it was pre-Covid, leading to deep fatigue at various points in the day. I found March through a third party and am very glad to have done so. March has a natural therapeutic manner, which puts you at ease as a patient. March was also confident of helping me, and indeed not only the sessions, but also through some take away practice, which is so simple yet effective, and indeed I have used it daily since. I would recommend March Russell, an excellent therapist who clearly has mastered his art."
  },
  {
    name: "George W.",
    text: "I recently did my first ever breathwork session, facilitated by March. It was pretty mind blowing. I felt intense levels of relaxation that I had never really experienced before and felt great for days afterwards. Breath is clearly a very powerful 'life hack' and March is the perfect person to help explore it with. He is a total natural, with a great deal of knowledge and an incredibly positive and calming presence."
  },
  {
    name: "Hugo D.",
    text: "I am very grateful for the work that I have done with March. I never knew how technical breathing could be, but more importantly what a dramatic and positive effect it can have. Added to this March has a wonderful ability to get me in the zone, relaxing the mind in quick order so that the most can be obtained from the session. I couldn't recommend this practice highly enough both from a relaxation point of view, but also the feeling one gets as a result of the various techniques we go through."
  },
  {
    name: "Stig I.",
    text: "I use March's App almost every day, and it's changed the game for my work/life balance. If ever I'm feeling overwhelmed during the day, I'll put it on and instantly feel reset. Love the sleep ones too.. still haven't heard how they end."
  },
  {
    name: "Jack F.",
    text: "I absolutely love March's breathwork; it brings me an incredible sense of calm and clarity that reminded me to stay grounded. The guided techniques are so easy to follow, leaving me rejuvenated and deeply connected to my inner self."
  },
  {
    name: "Sam C.",
    text: "I didn't realise how much I needed to breathe, until I was told to. Aside from living, I was unaware of any other of its benefits – but now I have a greater grasp on anxious feelings and can ground myself more. Being guided through simple yet effective breath work patterns by an expert was a privilege."
  },
  {
    name: "Jess A.",
    text: "I feel like you have introduced me to something quite extraordinary, my clarity of thought since our session has been on point!"
  },
  {
    name: "Edward H.",
    text: "March has a calming aura which alongside this mind-blowing technique makes for an amazing combination. Experienced two sessions so far, great intensity and cleared a lot of stress-related baggage. Felt like I was walking on a cloud for the rest of the day! Excited to see how my experiences develop."
  },
  {
    name: "Ollie B.",
    text: "March is an incredible teacher, full of compassion and empathy. Even if your mental health is the best it's ever been, I would highly recommend this because not only was it an enjoyable experience, but I also found it to be a cathartic one, releasing any tension, trauma, fears and neglected emotions that may have resurfaced later on in life. I have battled with anxiety and depression for a long time and I found March's sessions to be very helpful, alleviating a lot of the symptoms and taking me to a place of stillness and serenity. March was incredible during and after the sessions by checking in on me throughout the week. I'm hugely appreciative for March's practice."
  },
  {
    name: "Kathryn P.",
    text: "I had the opportunity to experience Conscious Connected Breathwork with March Russell last month. This was not something I knew much about and was curious and open to the experience. March held a calm and containing space as he supported and instructed me through the process. After a relaxing guided meditation, I found I started to relax into this unique way of breathing and noticed tensions in my body start to release as I began to drop into a new breathing rhythm. As I reflected back my experience to March after the session I felt energised and invigorated having started the session feeling tired and exhausted. I would definitely recommend this powerful and transformative experience with March."
  },
  {
    name: "Michael A.",
    text: "I had a wonderful breathwork session with March, he has such a calming presence! His recording has really helped me transition to sleep, something I've struggled with recently. Can't wait until my next session."
  },
  {
    name: "Mimi C.",
    text: "I was shocked by how powerful this was! March is a great facilitator. I felt like I'd rinsed out a lot of 'stuff', and noticed a real sense of calm the next day. Amazing experience and like a body / mind detox! Definitely recommend!"
  },
  {
    name: "Andrina W.",
    text: "I have had several 1-1 Breathwork sessions with March over the last couple of months and found it incredibly helpful both to alleviate stress and breath more effectively. He has a wonderfully calming demeanour and voice."
  },
  {
    name: "Charlie C.",
    text: "March's teaching style is both relaxingly informal and assuringly informative. My session with him was quite literally electrifying and left me feeling incredibly balanced. I feel like I've only just scratched the surface of what the power of the breath can be used to do!"
  },
  {
    name: "Plum OK.",
    text: "Recently I have been dealing with a few emotional blocks…with no idea how to get past them. One powerful breathwork session with March - which ended in tears (the good kind) and I already feel so much lighter. If this is something you are dealing with I would highly recommend being open minded and trying one of his 1-1 sessions."
  }
];

export const TestimonialsModal = ({ open, onOpenChange }: TestimonialsModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent hideClose className="w-[94%] sm:w-[90%] max-w-[1600px] max-h-[92vh] sm:max-h-[88vh] overflow-y-auto bg-black border border-white/20 rounded-[28px] p-0">
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-6 top-6 sm:right-8 sm:top-8 md:right-10 md:top-10 z-50 opacity-70 hover:opacity-100 transition-opacity"
        >
          <X className="w-6 h-6 text-white" />
        </button>
        <DialogHeader>
          <DialogTitle className="font-['PP_Editorial_Old'] text-center mb-8 sm:mb-10 md:mb-14 text-white pt-14 sm:pt-16 md:pt-20" style={{
            fontSize: 'clamp(1.8rem, 2.2vw, 2.4rem)',
            lineHeight: 1.15,
            fontWeight: 400
          }}>All Testimonials</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8 md:gap-10 px-6 sm:px-10 md:px-16 pb-8 sm:pb-12 md:pb-16">
          {allTestimonials.map((testimonial, index) => (
            <Card key={index} className="border border-gray-500/50 rounded-xl bg-background">
              <CardContent className="py-10 space-y-7">
                <p className="font-unica font-medium text-base md:text-lg text-white">{testimonial.name}</p>
              <p className="text-white/90" style={{
                fontSize: 'clamp(0.9rem, 1vw, 1rem)',
                lineHeight: 1.6
              }}>
                {testimonial.text}
              </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
