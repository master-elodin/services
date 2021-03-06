## Patch Notes
* 1
    * 1.3
        * 1.3.5
            * Enhancements:
                * Add indicator that additional info is available.
        * 1.3.4
            * Enhancements:
                * Easy copying of additional info!
        * 1.3.3
            * Bugfixes:
                * Fix logout button
                * Non-existent service-instances no longer blank out info after clicking
        * 1.3.2
            * Enhancements:
                * Enable showing additional data from service-specific pages
        * 1.3.1
            * Bugfixes:
                * Don't re-request info when clicking on additional data popup
        * 1.3.0
            * Enhancements:
                * Add additional data (user actions, JMX port, etc) for service instances
    * 1.2
        * 1.2.3
            * Bugfixes:
                * Now correctly sorts service instances after a refresh
        * 1.2.2
            * Bugfixes:
                * Fix validation fix so it requests from the correct location
        * 1.2.1
            * Bugfixes:
                * Re-sort correctly after starting/stopping services
        * 1.2.0
            * Enhancements
                * Add sign-out button
                * Add links for DEV/QA/PROD
    * 1.1
        * 1.1.10
            * Bugfixes:
                * No longer adds blank run configurations (#69)
                * No longer adds duplicate run configurations on save (#68)
                * No longer adds duplicate run configurations on upload (#60)
                * No longer error out when rapidly switching between host-groups (#61)
        * 1.1.9
            * Bugfixes:
                * Clicking a service when all nodes already selected will unselect them (#65)
                * Finishing a run configuration will properly reset it (#63)
                * Uploading a run configuration now will not change page to "group edit" mode
            * Enhancements
                * Show status when run configuration is running (#62)
