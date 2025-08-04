
function NotificationManager() {
    var self = this;
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            self.container = self.createContainer();
        });
    } else {
        this.container = this.createContainer();
    }
}

NotificationManager.prototype.createContainer = function() {
    var container = document.getElementById('notification-container') || document.createElement('div');
    container.id = 'notification-container';
    container.style.position = 'fixed';
    container.style.top = '20px';
    container.style.right = '20px';
    container.style.zIndex = 1000;
    if (!document.getElementById('notification-container')) {
        document.body.appendChild(container);
    }
    return container;
};

NotificationManager.prototype.show = function(message, type, duration) {
    var self = this;
    function showNow() {
        if (!type) type = 'info';
        if (!duration) duration = 3000;
        var notification = document.createElement('div');
        notification.className = 'notification ' + type;
        var icon = '';
        switch(type) {
            case 'success': icon = 'fa-check-circle'; break;
            case 'error': icon = 'fa-exclamation-circle'; break;
            case 'warning': icon = 'fa-exclamation-triangle'; break;
            default: icon = 'fa-info-circle';
        }
        notification.innerHTML = '<i class="fas ' + icon + '"></i> <span>' + message + '</span>';
        if (!self.container) {
            self.container = self.createContainer();
        }
        self.container.appendChild(notification);
        setTimeout(function() {
            notification.style.animation = 'slideOut 0.3s ease-out forwards';
            setTimeout(function() { notification.remove(); }, 300);
        }, duration);
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', showNow);
    } else {
        showNow();
    }
};

NotificationManager.prototype.success = function(message, duration) { this.show(message, 'success', duration); };
NotificationManager.prototype.error = function(message, duration) { this.show(message, 'error', duration); };
NotificationManager.prototype.warning = function(message, duration) { this.show(message, 'warning', duration); };
NotificationManager.prototype.info = function(message, duration) { this.show(message, 'info', duration); };

window.notifications = new NotificationManager();

