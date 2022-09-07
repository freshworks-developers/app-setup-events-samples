exports = {
    afterAppUpdateHandler: async function (args) {
        /**
         * Check if the schedule is created and delete if it exists.
         */
        try {
            let res = await $schedule.fetch({ name: 'syncSchedule' });
            if (res) renderData();
            else throw new Error('No Schedule found. Installation Halt');
        } catch (error) {
            renderData({ message: error.message });
        }
    },
    onAppInstallHandler: async function (args) {
        // 1. create a schedule
        let pointInfuture = new Date('September 9, 2022 09:17:00');

        let scheduleOpts = {
            name: "syncSchedule",
            schedule_at: pointInfuture.toISOString(),
            repeat: {
                time_unit: "minutes",
                frequency: 10
            },
            data: {
                desc: 'This data will be passed as argument to handler'
            }
        }
         try {
             let { status } = await $schedule.create(scheduleOpts);
             if (status != 200) throw new Error('unable to create a schedule');
             renderData();
            } catch (error) {
             renderData({ message: String(error.message) })
         }
    },
    onScheduledEventHandler: async function (args) {
        /**
         * Run a migration or check DB for verification/validation
         * Anything that you want to run Cron Job for.
         */
        return;
    }
};