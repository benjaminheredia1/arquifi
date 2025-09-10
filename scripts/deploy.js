const { ethers } = require('hardhat');

async function main() {
    console.log('🚀 Iniciando despliegue de contratos KoquiFI Lottery...');

    // Obtener el deployer
    const [deployer] = await ethers.getSigners();
    console.log('📝 Desplegando contratos con la cuenta:', deployer.address);
    console.log('💰 Balance de la cuenta:', ethers.formatEther(await deployer.provider.getBalance(deployer.address)), 'ETH');

    // Desplegar token KOKI
    console.log('\n🪙 Desplegando token KOKI...');
    const KokiToken = await ethers.getContractFactory('KokiToken');
    const kokiToken = await KokiToken.deploy();
    await kokiToken.waitForDeployment();
    
    const kokiTokenAddress = await kokiToken.getAddress();
    console.log('✅ Token KOKI desplegado en:', kokiTokenAddress);

    // Desplegar contrato de lotería
    console.log('\n🎰 Desplegando contrato de lotería...');
    const KokiLottery = await ethers.getContractFactory('KokiLottery');
    const kokiLottery = await KokiLottery.deploy(kokiTokenAddress);
    await kokiLottery.waitForDeployment();
    
    const lotteryAddress = await kokiLottery.getAddress();
    console.log('✅ Contrato de lotería desplegado en:', lotteryAddress);

    // Verificar contratos
    console.log('\n🔍 Verificando contratos...');
    try {
        await hre.run('verify:verify', {
            address: kokiTokenAddress,
            constructorArguments: [],
        });
        console.log('✅ Token KOKI verificado');
    } catch (error) {
        console.log('⚠️ Error verificando token KOKI:', error.message);
    }

    try {
        await hre.run('verify:verify', {
            address: lotteryAddress,
            constructorArguments: [kokiTokenAddress],
        });
        console.log('✅ Contrato de lotería verificado');
    } catch (error) {
        console.log('⚠️ Error verificando contrato de lotería:', error.message);
    }

    // Obtener información inicial
    console.log('\n📊 Información inicial:');
    const lotteryInfo = await kokiLottery.getCurrentLotteryInfo();
    console.log('🎫 Lotería ID:', lotteryInfo.id.toString());
    console.log('⏰ Tiempo de inicio:', new Date(parseInt(lotteryInfo.startTime.toString()) * 1000).toISOString());
    console.log('⏰ Tiempo de fin:', new Date(parseInt(lotteryInfo.endTime.toString()) * 1000).toISOString());
    console.log('💰 Precio del ticket:', ethers.formatEther(lotteryInfo.ticketPrice), 'KOKI');
    console.log('📊 Estado activo:', lotteryInfo.isActive);

    // Crear archivo de configuración
    const config = {
        network: hre.network.name,
        kokiToken: {
            address: kokiTokenAddress,
            name: 'Koki Token',
            symbol: 'KOKI'
        },
        lottery: {
            address: lotteryAddress,
            name: 'KokiFI Lottery',
            ticketPrice: '10',
            maxNumbers: 50,
            winningNumbersCount: 5
        },
        deployer: deployer.address,
        deploymentTime: new Date().toISOString()
    };

    const fs = require('fs');
    const configPath = `./deployments/${hre.network.name}.json`;
    
    // Crear directorio si no existe
    if (!fs.existsSync('./deployments')) {
        fs.mkdirSync('./deployments');
    }
    
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log(`\n💾 Configuración guardada en: ${configPath}`);

    // Mostrar resumen
    console.log('\n🎉 ¡Despliegue completado exitosamente!');
    console.log('='.repeat(50));
    console.log('📋 Resumen del despliegue:');
    console.log(`🌐 Red: ${hre.network.name}`);
    console.log(`🪙 Token KOKI: ${kokiTokenAddress}`);
    console.log(`🎰 Lotería: ${lotteryAddress}`);
    console.log(`👤 Desplegador: ${deployer.address}`);
    console.log('='.repeat(50));

    // Instrucciones para configuración
    console.log('\n📝 Próximos pasos:');
    console.log('1. Actualiza las variables de entorno en tu archivo .env:');
    console.log(`   KOKI_TOKEN_ADDRESS=${kokiTokenAddress}`);
    console.log(`   LOTTERY_CONTRACT_ADDRESS=${lotteryAddress}`);
    console.log('2. Inicia el servidor con: npm start');
    console.log('3. Configura el Frame de Farcaster con la URL de tu servidor');
    console.log('4. ¡Disfruta de KoquiFI Lottery! 🎰');

    return {
        kokiToken: kokiTokenAddress,
        lottery: lotteryAddress,
        config
    };
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('❌ Error durante el despliegue:', error);
        process.exit(1);
    });
