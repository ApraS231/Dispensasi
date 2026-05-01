import re

with open("mobile-app/app/(piket)/dashboard.tsx", "r") as f:
    content = f.read()

# We need to replace everything from <TopAppBar ... /> to </SafeAreaView>
start_str = "        <TopAppBar "
end_str = "      </SafeAreaView>"

start_idx = content.find(start_str)
end_idx = content.find(end_str) + len(end_str)

if start_idx == -1 or end_idx == -1:
    print("Could not find start or end bounds.")
    exit(1)

new_jsx = """        <TopAppBar
          showAvatar={true}
          avatarLabel={user?.name?.charAt(0)?.toUpperCase() || 'P'}
          showNotification={true}
        />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
          <View style={styles.mainContent}>
            {/* Header Card Status Piket */}
            <View style={styles.headerContainer}>
              <SoftCard style={styles.headerCard}>
                <View style={styles.headerTop}>
                  <View>
                    <Text style={styles.greeting}>Status Piket Hari Ini</Text>
                    <Text style={styles.dateText}>{todayDate}</Text>
                  </View>
                  <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
                    <Text style={styles.logoutText}>Keluar</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.toggleContainer}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.toggleLabel}>Kehadiran</Text>
                    <Text style={[styles.toggleStatus, { color: isReady ? COLORS.primary : COLORS.textMuted }]}>
                      {isReady ? 'SEDANG BERTUGAS' : 'ISTIRAHAT'}
                    </Text>
                  </View>
                  <MechanicalToggle
                    value={isReady}
                    onValueChange={async (val) => {
                      try {
                        await api.post('/piket/status', { is_ready: val });
                        setIsReady(val);
                      } catch(e) {}
                    }}
                  />
                </View>

                {/* Scan Button */}
                {isReady && (
                  <View style={styles.scanActionRow}>
                    <TouchableOpacity style={styles.scanBtn} onPress={() => expoRouter.push('/scan-qr')}>
                      <MaterialCommunityIcons name="qrcode-scan" size={24} color={COLORS.onPrimary} />
                      <Text style={styles.scanBtnText}>Pindai QR Siswa Keluar</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </SoftCard>
            </View>

            {/* Antrean Persetujuan Area */}
            <View style={styles.contentContainer}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Antrean Persetujuan</Text>
                <View style={styles.badgeCount}>
                  <Text style={styles.badgeCountText}>{pendingTickets.length}</Text>
                </View>
              </View>

              {pendingTickets.length > 0 ? pendingTickets.map((item) => (
                <View key={item.id} style={styles.ticketWrapper}>
                  <View style={styles.ticketHeaderRow}>
                    <AvatarInitials name={item.siswa?.name || 'Siswa'} size={40} fontSize={16} />
                    <View style={styles.ticketMeta}>
                      <Text style={styles.ticketName}>{item.siswa?.name || 'Siswa'}</Text>
                      <Text style={styles.ticketClass}>{item.kelas?.nama_kelas || 'Kelas'}</Text>
                    </View>
                  </View>

                  <TicketCard
                    item={item}
                    onPress={() => expoRouter.push(`/ticket/${item.id}`)}
                  />

                  <View style={styles.actionRow}>
                    <BouncyButton
                      title="Tolak"
                      variant="danger"
                      onPress={() => handleReject(item.id)}
                      style={styles.actionBtn}
                    />
                    <BouncyButton
                      title="Setujui & Terbitkan QR"
                      onPress={() => handleApprove(item.id)}
                      style={styles.actionBtn}
                    />
                  </View>
                </View>
              )) : (
                <Text style={styles.emptyText}>Tidak ada antrean persetujuan.</Text>
              )}
            </View>

            {/* Log Hari Ini Area inside a Card Container */}
            <View style={[styles.contentContainer, { marginTop: SPACING.xl }]}>
              <SoftCard>
                <View style={[styles.sectionHeader, { marginBottom: SPACING.md }]}>
                  <Text style={styles.sectionTitle}>Log Hari Ini</Text>
                </View>

                <View style={{ flexDirection: 'row', gap: 12, marginBottom: SPACING.lg }}>
                  <View style={[styles.statCard, { backgroundColor: COLORS.primaryContainer }]}>
                    <Text style={[styles.statValue, { color: COLORS.textPrimary }]}>{dailyLogStats.total}</Text>
                    <Text style={styles.statLabel}>Total Izin</Text>
                  </View>
                  <View style={[styles.statCard, { backgroundColor: COLORS.secondaryContainer }]}>
                    <Text style={[styles.statValue, { color: COLORS.textPrimary }]}>{dailyLogStats.scanned}</Text>
                    <Text style={styles.statLabel}>Telah Keluar</Text>
                  </View>
                  <View style={[styles.statCard, { backgroundColor: COLORS.tertiaryContainer }]}>
                    <Text style={[styles.statValue, { color: COLORS.textPrimary }]}>{dailyLogStats.total - dailyLogStats.scanned}</Text>
                    <Text style={styles.statLabel}>Menunggu</Text>
                  </View>
                </View>

                {dailyLogs.length > 0 ? dailyLogs.map((item) => (
                  <DailyLogCard key={item.id} item={item} />
                )) : (
                  <Text style={styles.emptyText}>Belum ada log hari ini.</Text>
                )}
              </SoftCard>
            </View>

          </View>
        </ScrollView>

        <GlassFAB onPress={() => expoRouter.push('/scan-qr')} icon="qrcode-scan" style={{ bottom: 100 }} />
      </SafeAreaView>"""

new_content = content[:start_idx] + new_jsx + content[end_idx:]

with open("mobile-app/app/(piket)/dashboard.tsx", "w") as f:
    f.write(new_content)
