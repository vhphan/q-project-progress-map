<template>
  <div class="about">
    <q-card class="my-card">
      <q-card-section>
        <div class="text-h6">Project Progress Map</div>
        <div class="text-subtitle2">The Automation Team</div>
        <span>&copy;2022 Ericsson</span>
      </q-card-section>

      <q-card-actions>
        <div class="q-ma-xs q-pa-xs">
          This application is in <span style="text-decoration: underline; font-weight: bold;">beta.</span>. <br/>
          <q-separator/>
          <div class="q-mt-md">Developed and maintained by: <br/>
          </div>

            <q-btn
                color="blue-5"
                label="Email:"
                @click="() => window.open('mailto:vee.huen.phan@ericsson.com')"
                glossy
                icon-right="email"
            >
              <div>&nbsp vee.huen.phan@ericsson.com</div>
              <q-tooltip
                  :offset="[10, 10]"
              >
                Click to Send Email

              </q-tooltip>
            </q-btn>
        </div>
      </q-card-actions>


    </q-card>


  </div>
</template>

<script>
export default {
  name: "About"
};
</script>

<style scoped>

</style>