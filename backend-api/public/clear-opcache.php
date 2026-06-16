<?php
// Clear PHP OPcache on web server (FPM) level
if (function_exists('opcache_reset')) {
    opcache_reset();
    echo "<h1>OPcache cleared successfully!</h1>";
} else {
    echo "<h1>OPcache is not enabled or opcache_reset is disabled.</h1>";
}
unlink(__FILE__); // Automatically delete this script after execution for security
