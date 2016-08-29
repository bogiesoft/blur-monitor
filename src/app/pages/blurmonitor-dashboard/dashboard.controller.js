(function() {
    'use strict';

    angular.module('BlurMonitor.pages.dashboard').controller('DashboardController', [
        '$scope',
        '$interval',
        '_',
        'refreshInterval',
        'SystemResource',
        'ProcessorResource',
        'processorPercentageThreshold',
        'MemoryResource',
        'memoryPercentageThreshold',
        'moment',
        DashboardController]);

    function DashboardController($scope, $interval, _, refreshInterval, SystemResource,
                                 ProcessorResource, processorPercentageThreshold,
                                 MemoryResource, memoryPercentageThreshold, moment) {
        var vm = this;

        vm.system = null;

        getSystemInfo();
        determineAlerts();

        vm.interval = $interval(function() {
            getSystemInfo();
            determineAlerts();
        }, refreshInterval);

        $scope.$on("$destroy", function() {
            $interval.cancel(vm.interval);
        });

        function getSystemInfo() {
            SystemResource.get(function (system) {
                system.uptime = moment.duration(system.uptime, 'seconds');
                vm.system = system;
            });
        }

        function determineAlerts() {
            vm.alerts = vm.alerts || [];

            checkProcessor();
            checkMemory();
            checkDisks();
        }

        function alertDisplayed(key) {
            return _.find(vm.alerts, {key: key});
        }

        function removeAlert(key) {
            _.remove(vm.alerts, {
                key: key
            });
        }

        function checkProcessor() {
            ProcessorResource.getUtilization().$promise.then(function(loadAverages) {
                removeAlert('processorDown');

                if(loadAverages[0] > processorPercentageThreshold) {
                    if(!alertDisplayed('load1')) {
                        vm.alerts.push({
                            key: 'load1',
                            class: 'bg-warning',
                            icon: 'ion-arrow-graph-up-right',
                            message: 'The 1 minute load average of the processor is greater than ' + processorPercentageThreshold + '%.'
                        });
                    }
                } else {
                    removeAlert('load1');
                }

                if(loadAverages[1] > processorPercentageThreshold) {
                    if(!alertDisplayed('load5')) {
                        vm.alerts.push({
                            key: 'load5',
                            class: 'bg-warning',
                            icon: 'ion-arrow-graph-up-right',
                            message: 'The 5 minute load average of the processor is greater than ' + processorPercentageThreshold + '%.'
                        });
                    }
                }else {
                    removeAlert('load5');
                }

                if(loadAverages[2] > processorPercentageThreshold) {
                    if(!alertDisplayed('load15')) {
                        vm.alerts.push({
                            key: 'load15',
                            class: 'bg-warning',
                            icon: 'ion-arrow-graph-up-right',
                            message: 'The 15 minute load average of the processor is greater than ' + processorPercentageThreshold + '%.'
                        });
                    }
                } else {
                    removeAlert('load15');
                }
            }, function() {
                if(!alertDisplayed('processorDown')) {
                    vm.alerts.push({
                        key: 'processorDown',
                        class: 'bg-danger',
                        icon: 'ion-alert',
                        message: 'The processor service isn\'t responding.'
                    });
                } else {
                    removeAlert('processorDown');
                }
            });
        }

        function checkMemory() {
            MemoryResource.get().$promise.then(function(memory) {
                removeAlert('memoryDown');

                if(memory.actualUsed / memory.actualTotal * 100 > memoryPercentageThreshold) {
                    if(!alertDisplayed('memoryHigh')) {
                        vm.alerts.push({
                            key: 'memoryHigh',
                            class: 'bg-warning',
                            icon: 'ion-arrow-graph-up-right',
                            message: 'The memory utilization is greater than ' + memoryPercentageThreshold + '%.'
                        });
                    }
                } else {
                    removeAlert('memoryHigh');
                }

                if(memory.swapUsed / memory.swapTotal * 100 > memoryPercentageThreshold) {
                    if(!alertDisplayed('swapHigh')) {
                        vm.alerts.push({
                            key: 'swapHigh',
                            class: 'bg-warning',
                            icon: 'ion-arrow-graph-up-right',
                            message: 'The swap utilization is greater than ' + memoryPercentageThreshold + '%.'
                        });
                    }
                } else {
                    removeAlert('swapHigh');
                }

            }, function() {
                if(!alertDisplayed('memoryDown')) {
                    vm.alerts.push({
                        key: 'memoryDown',
                        class: 'bg-danger',
                        icon: 'ion-alert',
                        message: 'The memory service isn\'t responding.'
                    });
                } else {
                    removeAlert('memoryDown');
                }
            });
        }

        function checkDisks() {

        }
    }
})();