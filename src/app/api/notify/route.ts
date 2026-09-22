import { createAdminClient } from '@/lib/supabase/admin';
import { configureWebPush } from '@/lib/push/vapid';
import { isAuthorizedCron } from '@/lib/push/authorizeCron';
import { getCairoHour } from '@/lib/push/cairoHour';

const azkarDayAndNight = [
    "بسم الله الذي لا يضر مع اسمه شيئ في الارض ولا في السماء وهو السميع العليم (3 مرات)",
    "اللهم بك أصبحنا، وبك أمسينا، وبك نحيا، وبك نموت، وإليك النشور.",
    "يا حي يا قيوم برحمتك أستغيث أصلح لي شأني كله ولا تكلني إلى نفسي طرفة عين.",
    "رضيت بالله رباً، وبالإسلام ديناً، وبمحمد صلى الله عليه وسلم نبياً.",
    "حسبي الله لا إله إلا هو عليه توكلت وهو رب العرش العظيم. (7 مرات)"
];

const sport = [
    "عاش يا بطل! 5 او 10 عدات ضغط هيبقي زي الفل.. افتكر التمرين.",
    "الرياضة مش بس عضلات، الرياضة صفاء ذهني وراحة بال.. ابدأ دلوقتي.",
    "كل تمرينة بتعملها النهاردة هي استثمار في صحتك بكره.. مفيش وقت للكسل.",
    "الفرق بين اللي وصل واللي لسه، هو إن اللي وصل مابطلش.. كمل يا بطل.",
    "صحتك هي رأس مالك الحقيقي، 10 دقايق رياضة كفيلة تغير مودك ويومك."
];

export async function GET(request: Request) {
    if (!isAuthorizedCron(request)) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createAdminClient();
    const webpush = configureWebPush();
    const cairoHour = getCairoHour();

    let notificationContent = {
        title: "تذكير المهام 📝",
        body: "لا تنسَ مراجعة قائمة مهامك لهذا اليوم!",
    };

    let url = '/'

    if (cairoHour === 23) {
        notificationContent = {
            title: "نهاية اليوم 💪",
            body: "افتكر مهماتك ي بطل.. راجع اللي خلص واللي لسه بكره."
        };
        url = '/'
    } else if (cairoHour === 14) {
        notificationContent = {
            title: "مراجعة منتصف اليوم 🕒",
            body: "ها يا بطل، طمني عملت إيه في مهام النهاردة؟ لسه فيه وقت تخلص الباقي."
        };
        url = '/'
    } else if (cairoHour === 19) {
        notificationContent = {
            title: "وقت الرياضة 🏃‍♂️",
            body: sport[Math.floor(Math.random() * sport.length)],
        };
        url = '/'
    } else if (cairoHour === 16 || cairoHour === 5) {
        notificationContent = {
            title: cairoHour === 5 ? "أذكار الصباح ☀️" : "أذكار المساء ✨",
            body: azkarDayAndNight[Math.floor(Math.random() * azkarDayAndNight.length)],
        };
        url = '/'
    } else if (cairoHour === 10) {
        notificationContent = {
            title: "إضغط واستغفر 10 مرات او كما تحب",
            body: `اللهم اغفرلي`,
        };
        url = '/group-tasks'
    } else if (cairoHour === 13) {
        try {
            const response = await fetch('https://api.alquran.cloud/v1/ayah/random');
            const json = await response.json();
            const ayah = json.data;

            notificationContent = {
                title: `${ayah.surah.name} - آية ${ayah.numberInSurah}`,
                body: ayah.text
            };
            url = '/';
        } catch {
            notificationContent = {
                title: "آية قرآنية 📖",
                body: "ألا بذكر الله تطمئن القلوب"
            };
        }
    } else if (cairoHour === 18) {
        try {
            const response = await fetch('https://api.alquran.cloud/v1/ayah/random');
            const json = await response.json();
            const ayah = json.data;

            notificationContent = {
                title: `آية المساء | ${ayah.surah.name}`,
                body: ayah.text
            };
            url = '/';
        } catch {
            notificationContent = {
                title: "تذكير إيماني 🌙",
                body: "ألا بذكر الله تطمئن القلوب"
            };
        }
    }

    const { data: subs } = await supabase.from('push_subscriptions').select('endpoint, auth, p256dh');

    if (subs && subs.length > 0) {
        const pushPromises = subs.map(sub => {
            return webpush.sendNotification(
                { endpoint: sub.endpoint, keys: { auth: sub.auth, p256dh: sub.p256dh } },
                JSON.stringify({
                    ...notificationContent,
                    tag: 'task-reminder',
                    renotify: true,
                    data: { url: url }
                })
            ).catch(async (err: { statusCode?: number }) => {
                if (err.statusCode === 410 || err.statusCode === 404) {
                    await supabase.from('push_subscriptions').delete().eq('endpoint', sub.endpoint);
                }
            });
        });

        await Promise.all(pushPromises);
    }

    return Response.json({ success: true, cairoHour, message: "Notification sent!" });
}
