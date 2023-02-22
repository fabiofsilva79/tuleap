FROM rockylinux@sha256:99376f245b2d13d273260654d3b769918aa8af29b04f771add8ea0c9bf40a66c AS tuleap-installrpms-base
# To test RHEL9:
#FROM registry.access.redhat.com/ubi9 AS tuleap-installrpms-base
# To test AlmaLinux
#FROM almalinux:9

ENV container docker

STOPSIGNAL SIGRTMIN+3

RUN rm -f /lib/systemd/system/multi-user.target.wants/*;\
    rm -f /etc/systemd/system/*.wants/*;\
    rm -f /lib/systemd/system/local-fs.target.wants/*; \
    rm -f /lib/systemd/system/sockets.target.wants/*udev*; \
    rm -f /lib/systemd/system/sockets.target.wants/*initctl*; \
    rm -f /lib/systemd/system/basic.target.wants/*;\
    rm -f /lib/systemd/system/anaconda.target.wants/* && \
    dnf install -y \
        openssh-server \
        createrepo \
        mysql-server \
        https://dl.fedoraproject.org/pub/epel/epel-release-latest-9.noarch.rpm \
        https://rpms.remirepo.net/enterprise/remi-release-9.rpm && \
    dnf clean all && \
    rm -rf /var/cache/yum

COPY tuleap-local.repo /etc/yum.repos.d/
COPY install.el9.sh /install.sh
COPY run.sh /run.sh
COPY sql-mode.cnf /etc/my.cnf.d/sql-mode.cnf

VOLUME [ "/sys/fs/cgroup" ]
CMD ["/usr/sbin/init"]

FROM tuleap-installrpms-base AS ci
COPY install-and-run.ci.service /etc/systemd/system/install-and-run.service
RUN systemctl enable install-and-run.service && \
    echo "Storage=persistent" >> /etc/systemd/journald.conf

FROM tuleap-installrpms-base AS interactive
COPY install-and-run.service /etc/systemd/system/install-and-run.service
RUN systemctl enable install-and-run.service
