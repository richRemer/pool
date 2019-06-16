pool CLI command
================
Execute commands for a pool of servers.

Usage
-----
```sh
# print the IP address of every server in the pool
pool my-pool.example.com echo {}

# ssh into each server in pool and restart foo service
pool my-pool.zingle.me ssh root@{} systemctl restart foo.service
```
