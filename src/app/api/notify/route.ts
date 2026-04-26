import { createClient } from '@supabase/supabase-js';
import webpush from 'web-push';

// إعداد مفاتيح VAPID
webpush.setVapidDetails(
    'mailto:yousefmahmoud150@gmail.com',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.NEXT_PUBLIC_VAPID_PRIVATE_KEY!
);


const azkarDayAndNight = [
    "بسم الله الذي لا يضر مع اسمه شيئ في الارض ولا في السماء وهو السميع العليم (3 مرات)",
    "اللهم بك أصبحنا، وبك أمسينا، وبك نحيا، وبك نموت، وإليك النشور.",
    "يا حي يا قيوم برحمتك أستغيث أصلح لي شأني كله ولا تكلني إلى نفسي طرفة عين.",
    "رضيت بالله رباً، وبالإسلام ديناً، وبمحمد صلى الله عليه وسلم نبياً.",
    "حسبي الله لا إله إلا هو عليه توكلت وهو رب العرش العظيم. (7 مرات)"
];


const zikr = [
    "سُبْحَانَ اللهِ وَبِحَمْدِهِ ، سُبْحَانَ اللهِ الْعَظِيمِ",
    "لا حَوْلَ وَلا قُوَّةَ إِلا بِاللهِ (كنز من كنوز الجنة)",
    "أستغفر الله العظيم وأتوب إليه",
    "لا إله إلا أنت سبحانك إني كنت من الظالمين",
    "اللهم صلِّ وسلم وبارك على نبينا محمد",
    "اللهم اني اعوذ بك من مرض القلب , ومن الشيطان الرجيم",
    "اللهم تب علي يا رب إنك انت التواب الرحيم",
    "اللهم اني اعوذ بك من زوال نعمتك , وتحول عافيتك , وفجاءة نقمتك , وجميع سخطك",
    "اللهم اني اعوذ بك من الجبن , واعوذ بك من البخل , واعوذ بك من الهرم , واعوذ بك من فتنة الدنيا وعذاب القبر",
    "اللهم إني اسألك الهدي و التقي و العفاف و الغني",
    "اللهم صل وسلم وبارك على سيدنا محمد"
];


const sport = [
    "عاش يا بطل! 5 او 10 عدات ضغط هيبقي زي الفل.. افتكر التمرين.",
    "الرياضة مش بس عضلات، الرياضة صفاء ذهني وراحة بال.. ابدأ دلوقتي.",
    "كل تمرينة بتعملها النهاردة هي استثمار في صحتك بكره.. مفيش وقت للكسل.",
    "الفرق بين اللي وصل واللي لسه، هو إن اللي وصل مابطلش.. كمل يا بطل.",
    "صحتك هي رأس مالك الحقيقي، 10 دقايق رياضة كفيلة تغير مودك ويومك."
];

export async function GET() {
    const supabase = await createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const now = new Date();
    const cairoHour = (now.getUTCHours() + 2) % 24;

    let notificationContent = {
        title: "تذكير المهام 📝",
        body: "لا تنسَ مراجعة قائمة مهامك لهذا اليوم!",
    };

    let url = '/'

    // نظام الـ Random المكتمل (6 مواعيد)
    if (cairoHour === 23) { // 11 مساءً
        notificationContent = {
            title: "نهاية اليوم 💪",
            body: "افتكر مهماتك ي بطل.. راجع اللي خلص واللي لسه بكره."
        };
        url = '/'
    } else if (cairoHour === 14) { // 2 ظهراً (توقيت مصر)
        notificationContent = {
            title: "مراجعة منتصف اليوم 🕒",
            body: "ها يا بطل، طمني عملت إيه في مهام النهاردة؟ لسه فيه وقت تخلص الباقي."
        };
        url = '/'
    } else if (cairoHour === 19) { // 7 مساءً
        notificationContent = {
            title: "وقت الرياضة 🏃‍♂️",
            body: sport[Math.floor(Math.random() * sport.length)],
        };
        url = '/'
    } else if (cairoHour === 16 || cairoHour === 5) { // 4 عصراً و 5 فجراً
        notificationContent = {
            title: cairoHour === 5 ? "أذكار الصباح ☀️" : "أذكار المساء ✨",
            body: azkarDayAndNight[Math.floor(Math.random() * azkarDayAndNight.length)],
        };
        url = '/'
    } else if (cairoHour === 10) { // 10 صباحاً
        notificationContent = {
            title: "بداية اليوم 🚀",
            body: `الحمد لله، إن شاء الله خير. ${zikr[Math.floor(Math.random() * zikr.length)]}`,
        };
    } else if (cairoHour === 13) { // الساعة 1 ظهراً
        try {
            const response = await fetch('https://api.alquran.cloud/v1/ayah/random');
            const json = await response.json();
            const ayah = json.data;

            notificationContent = {
                title: `${ayah.surah.name} - آية ${ayah.numberInSurah}`,
                body: ayah.text
            };
            url = '/';
        } catch (error) {
            // Fallback: لو الـ API وقع لاي سبب، نبعت حاجة ثابتة عشان الإشعار ميقفش
            notificationContent = {
                title: "آية قرآنية 📖",
                body: "ألا بذكر الله تطمئن القلوب"
            };
        }
    } else if (cairoHour === 18) { // الساعة 6 مساءً
        try {
            const response = await fetch('https://api.alquran.cloud/v1/ayah/random');
            const json = await response.json();
            const ayah = json.data;

            notificationContent = {
                title: `آية المساء | ${ayah.surah.name}`,
                body: ayah.text
            };
            url = '/';
        } catch (error) {
            notificationContent = {
                title: "تذكير إيماني 🌙",
                body: "ألا بذكر الله تطمئن القلوب"
            };
        }
    }

    const { data: subs } = await supabase.from('push_subscriptions').select('*, users(full_name)'); // جلب بيانات المستخدم المرتبط بالاشتراك

    // if (subs && subs.length > 0) {

    //     const pushPromises = subs.map(sub =>
    //         webpush.sendNotification(
    //             { endpoint: sub.endpoint, keys: { auth: sub.auth, p256dh: sub.p256dh } },
    //             JSON.stringify({
    //                 ...notificationContent,
    //                 icon: '/icon.png',
    //                 badge: '/badge.png',
    //                 tag: 'task-reminder',
    //                 renotify: true,
    //                 data: { url: url }
    //             })
    //         ).catch(async (err) => {
    //             // تنظيف الاشتراكات المنتهية 410
    //             if (err.statusCode === 410 || err.statusCode === 404) {
    //                 await supabase.from('push_subscriptions').delete().eq('endpoint', sub.endpoint);
    //             }
    //         })
    //     );
    //     await Promise.all(pushPromises);
    // }

    if (subs && subs.length > 0) {
        const pushPromises = subs.map(sub => {
            // استخراج الاسم، لو مش موجود (أو لسه ما اتحدثش) هنستخدم "يا بطل" كقيمة افتراضية
            const userName = sub.users?.full_name || "بطل";

            // تجهيز النص المخصص
            const personalizedBody = `${userName}، ${notificationContent.body}`;

            return webpush.sendNotification(
                { endpoint: sub.endpoint, keys: { auth: sub.auth, p256dh: sub.p256dh } },
                JSON.stringify({
                    ...notificationContent,
                    body: personalizedBody, // استخدمنا هنا النص المخصص بالاسم
                    icon: '/icon.png',
                    badge: '/badge.png',
                    tag: 'task-reminder',
                    renotify: true,
                    data: { url: url }
                })
            ).catch(async (err) => {
                // تنظيف الاشتراكات المنتهية 410
                if (err.statusCode === 410 || err.statusCode === 404) {
                    await supabase.from('push_subscriptions').delete().eq('endpoint', sub.endpoint);
                }
            });
        });

        await Promise.all(pushPromises);
    }

    return Response.json({ success: true, cairoHour, message: "Notification sent!" });
}